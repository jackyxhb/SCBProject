const BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = {
  async health() {
    const res = await fetch(`${BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.ok ? 'ok' : 'not ok';
  },
  async generateQR({ boxId, ttlSeconds = 300 }) {
    const res = await fetch(`${BASE}/qr/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ boxId, ttlSeconds }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data;
  },
  async validateQR({ payload }) {
    const res = await fetch(`${BASE}/qr/validate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload }),
    });
    const json = await res.json();
    return json;
  },
  async getPublicKey() {
    const res = await fetch(`${BASE}/qr/public-key`);
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data.publicKey;
  },
  async createParcel({ boxId, recipientUid }) {
    const res = await fetch(`${BASE}/parcels`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ boxId, recipientUid }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data;
  },
  async notifyParcel({ parcelId, phone, email, ttlSeconds = 900 }) {
    const res = await fetch(`${BASE}/parcels/${parcelId}/notify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone, email, ttlSeconds }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data;
  },
};
