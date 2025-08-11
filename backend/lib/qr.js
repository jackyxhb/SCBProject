import { encryptPayload, decryptPayload } from './crypto.js';
import store from './store/index.js';
import { randomUUID as nodeRandomUUID } from 'crypto';

export async function generateQrKey({ boxId, ttlSeconds = 300 }) {
  if (!boxId) throw new Error('boxId required');
  const id = nodeRandomUUID();
  const now = Date.now();
  const exp = now + Math.max(0, ttlSeconds) * 1000;
  const payload = { id, boxId, iat: now, exp };
  const encrypted = encryptPayload(payload);
  await store.create({ id, exp });
  return { id, payload: encrypted, exp };
}

export async function validateQrPayload({ payload }) {
  let decoded;
  try {
    decoded = decryptPayload(payload);
  } catch (e) {
    return { valid: false, error: 'decrypt_failed' };
  }
  const rec = await store.get(decoded.id);
  if (!rec) return { valid: false, error: 'unknown_key' };
  if (store.isExpired(rec)) return { valid: false, error: 'expired' };
  if (rec.consumed) return { valid: false, error: 'consumed' };
  await store.consume(rec.id);
  return { valid: true, id: rec.id };
}
