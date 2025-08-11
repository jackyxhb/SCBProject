import { getFirebaseAdmin } from './firebase.js';

const COLLECTION = 'qrKeys';

function toRec(id, data) {
  if (!data) return null;
  return {
    id,
    exp: data.exp ?? null,
    consumed: !!data.consumed,
    createdAt: data.createdAt ?? null,
  };
}

class FirestoreStore {
  constructor(admin) {
    this.db = admin.firestore();
  }

  async create({ id, exp }) {
    const docRef = this.db.collection(COLLECTION).doc(id);
  const rec = { exp, expAt: new Date(exp), consumed: false, createdAt: Date.now() };
    await docRef.set(rec, { merge: false });
    return { id, ...rec };
  }

  async get(id) {
    const snap = await this.db.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return toRec(snap.id, snap.data());
  }

  async consume(id) {
    const docRef = this.db.collection(COLLECTION).doc(id);
    return await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists) return null;
      const data = snap.data();
      if (data.consumed) return toRec(snap.id, data);
      tx.update(docRef, { consumed: true });
      return { id: snap.id, exp: data.exp ?? null, consumed: true, createdAt: data.createdAt ?? null };
    });
  }

  isExpired(rec) {
    return typeof rec.exp === 'number' && Date.now() > rec.exp;
  }

  async purgeExpired({ now = Date.now(), limit = 300 } = {}) {
    // Query by numeric exp for simplicity; expAt is present for TTL policies
    const snap = await this.db
      .collection(COLLECTION)
      .where('exp', '<=', now)
      .limit(limit)
      .get();
    if (snap.empty) return { deleted: 0 };
    const batch = this.db.batch();
    let count = 0;
    snap.forEach((doc) => {
      batch.delete(doc.ref);
      count += 1;
    });
    await batch.commit();
    return { deleted: count };
  }
}

export default function getStore() {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  return new FirestoreStore(admin);
}
