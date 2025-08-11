import { Router } from 'express';
import { generateQrKey, validateQrPayload } from '../lib/qr.js';
import { ensureKeyPair } from '../lib/crypto.js';
import store from '../lib/store/index.js';

const router = Router();

// Example placeholder endpoint patterns to mirror in future features
router.post('/qr/generate', async (req, res) => {
  const { boxId, ttlSeconds } = req.body || {};
  if (!boxId) return res.status(400).json({ ok: false, error: 'boxId required' });
  try {
  const key = await generateQrKey({ boxId, ttlSeconds });
    return res.json({ ok: true, data: { keyId: key.id, qr: { payload: key.payload, exp: key.exp } } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'generate_failed' });
  }
});

router.post('/qr/validate', async (req, res) => {
  const { payload } = req.body || {};
  if (!payload) return res.status(400).json({ ok: false, error: 'payload required' });
  const result = await validateQrPayload({ payload });
  const status = result.valid ? 200 : 400;
  return res.status(status).json({ ok: result.valid, data: result.valid ? { id: result.id } : undefined, error: result.valid ? undefined : result.error });
});

router.post('/notify/recipient', (req, res) => {
  // TODO: implement Twilio/nodemailer
  return res.json({ ok: true });
});

router.get('/qr/public-key', (req, res) => {
  const { publicKey } = ensureKeyPair();
  return res.json({ ok: true, data: { publicKey } });
});

router.post('/admin/purge-expired', async (req, res) => {
  const token = req.headers['x-admin-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (!process.env.ADMIN_TASK_TOKEN || token !== process.env.ADMIN_TASK_TOKEN) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  try {
    const result = await (store.purgeExpired ? store.purgeExpired({}) : Promise.resolve({ deleted: 0 }));
    return res.json({ ok: true, data: result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'purge_failed' });
  }
});

export default router;
