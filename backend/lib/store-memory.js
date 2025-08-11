class InMemoryStore {
  constructor() {
    this.qr = new Map();
  }

  async create({ id, exp }) {
    const rec = { id, exp, consumed: false, createdAt: Date.now() };
    this.qr.set(id, rec);
    return rec;
  }

  async get(id) {
    return this.qr.get(id) || null;
  }

  async consume(id) {
    const rec = this.qr.get(id);
    if (!rec) return null;
    rec.consumed = true;
    this.qr.set(id, rec);
    return rec;
  }

  isExpired(rec) {
    return typeof rec.exp === 'number' && Date.now() > rec.exp;
  }

  async purgeExpired({ now = Date.now() } = {}) {
    let count = 0;
    for (const [id, rec] of this.qr.entries()) {
      if (typeof rec.exp === 'number' && now > rec.exp) {
        this.qr.delete(id);
        count += 1;
      }
    }
    return { deleted: count };
  }
}

const store = new InMemoryStore();
export default store;
