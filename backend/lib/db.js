import { getFirebaseAdmin } from './firebase.js';
import { randomUUID } from 'crypto';

const admin = getFirebaseAdmin();
const useFirestore = !!admin && process.env.USE_FIRESTORE === '1';

const memory = {
  boxes: new Map(),
  parcels: new Map(),
  audit: [],
};

function now() { return Date.now(); }

// Firestore helpers
function fsDb() { return admin.firestore(); }

// Boxes
export async function createBox({ id, ownerUid = null, location = null }) {
  const doc = {
    id, ownerUid, location,
    state: 'locked', battery: null, lastSeen: null,
    createdAt: now(), updatedAt: now(),
  };
  if (useFirestore) {
    await fsDb().collection('boxes').doc(id).set(doc, { merge: false });
  } else {
    memory.boxes.set(id, doc);
  }
  return doc;
}

export async function getBox(id) {
  if (useFirestore) {
    const snap = await fsDb().collection('boxes').doc(id).get();
    return snap.exists ? snap.data() : null;
  }
  return memory.boxes.get(id) || null;
}

export async function updateBoxState(id, { state, battery = null, lastSeen = now() }) {
  const allowed = ['locked', 'unlocked', 'occupied', 'tamper'];
  const patch = { updatedAt: now() };
  if (state) {
    if (!allowed.includes(state)) throw new Error('invalid_state');
    patch.state = state;
  }
  if (battery !== null) patch.battery = battery;
  if (lastSeen !== null) patch.lastSeen = lastSeen;

  if (useFirestore) {
    const ref = fsDb().collection('boxes').doc(id);
    await ref.set(patch, { merge: true });
    const snap = await ref.get();
    return snap.exists ? snap.data() : null;
  }
  const existing = memory.boxes.get(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  memory.boxes.set(id, merged);
  return merged;
}

// Parcels
export async function createParcel({ boxId, recipientUid }) {
  const id = randomUUID();
  const doc = {
    id, boxId, recipientUid,
    status: 'created', createdAt: now(), updatedAt: now(),
  };
  if (useFirestore) {
    await fsDb().collection('parcels').doc(id).set(doc, { merge: false });
  } else {
    memory.parcels.set(id, doc);
  }
  return doc;
}

export async function getParcel(id) {
  if (useFirestore) {
    const snap = await fsDb().collection('parcels').doc(id).get();
    return snap.exists ? snap.data() : null;
  }
  return memory.parcels.get(id) || null;
}

export async function updateParcelStatus(id, { status }) {
  const allowed = ['created', 'deposited', 'notified', 'picked_up'];
  if (!allowed.includes(status)) throw new Error('invalid_status');
  const patch = { status, updatedAt: now() };
  if (useFirestore) {
    const ref = fsDb().collection('parcels').doc(id);
    await ref.set(patch, { merge: true });
    const snap = await ref.get();
    return snap.exists ? snap.data() : null;
  }
  const existing = memory.parcels.get(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  memory.parcels.set(id, merged);
  return merged;
}

// Audit
export async function logAudit({ actor = 'system', action, boxId = null, parcelId = null, meta = null, at = now() }) {
  const rec = { actor, action, boxId, parcelId, meta, at };
  if (useFirestore) {
    await fsDb().collection('auditLogs').add(rec);
  } else {
    memory.audit.push(rec);
  }
  return rec;
}
