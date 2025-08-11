import { getIdToken } from './auth';
const BASE = import.meta.env.VITE_API_BASE || '/api';

async function withAuthHeaders(extra = {}) {
  const token = await getIdToken();
  return {
    ...extra,
    headers: {
      'content-type': 'application/json',
      ...(extra.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

export const api = {
  async health() {
    const res = await fetch(`${BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.ok ? 'ok' : 'not ok';
  },
  async generateQR({ boxId, ttlSeconds = 300 }) {
    const init = await withAuthHeaders({
      method: 'POST',
      body: JSON.stringify({ boxId, ttlSeconds }),
    });
    const res = await fetch(`${BASE}/qr/generate`, init);
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data;
  },
  async validateQR({ payload }) {
    const init = await withAuthHeaders({
      method: 'POST',
      body: JSON.stringify({ payload }),
    });
    const res = await fetch(`${BASE}/qr/validate`, init);
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
    const init = await withAuthHeaders({
      method: 'POST',
      body: JSON.stringify({ boxId, recipientUid }),
    });
    const res = await fetch(`${BASE}/parcels`, init);
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data;
  },
  async notifyParcel({ parcelId, phone, email, ttlSeconds = 900 }) {
    const init = await withAuthHeaders({
      method: 'POST',
      body: JSON.stringify({ phone, email, ttlSeconds }),
    });
    const res = await fetch(`${BASE}/parcels/${parcelId}/notify`, init);
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json.data;
  },
};
