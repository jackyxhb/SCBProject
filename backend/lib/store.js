class InMemoryStore {
  constructor() {
    this.qr = new Map();
  }

  create({ id, exp }) {
    const rec = { id, exp, consumed: false, createdAt: Date.now() };
    this.qr.set(id, rec);
    return rec;
  }

  get(id) {
    return this.qr.get(id) || null;
  }

  consume(id) {
    const rec = this.qr.get(id);
    if (!rec) return null;
    rec.consumed = true;
    this.qr.set(id, rec);
    return rec;
  }

  isExpired(rec) {
    return typeof rec.exp === 'number' && Date.now() > rec.exp;
  }
}

const store = new InMemoryStore();
export default store;
