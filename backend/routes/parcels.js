import { Router } from 'express';
import { createParcel, getParcel, updateParcelStatus } from '../lib/db.js';
import { generateQrKey } from '../lib/qr.js';
import { sendSMS, sendEmail } from '../lib/notify.js';
import { requireAuth } from '../lib/auth.js';
import { notifyLimiter } from '../lib/rateLimit.js';
import { logAudit } from '../lib/audit.js';

const router = Router();

router.post('/', async (req, res) => {
  const { boxId, recipientUid } = req.body || {};
  if (!boxId || !recipientUid) return res.status(400).json({ ok: false, error: 'boxId and recipientUid required' });
  const parcel = await createParcel({ boxId, recipientUid });
  await logAudit({ action: 'parcel_created', boxId, parcelId: parcel.id, meta: { recipientUid } });
  return res.json({ ok: true, data: parcel });
});

router.get('/:id', async (req, res) => {
  const parcel = await getParcel(req.params.id);
  if (!parcel) return res.status(404).json({ ok: false, error: 'not_found' });
  return res.json({ ok: true, data: parcel });
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ ok: false, error: 'status required' });
  try {
    const updated = await updateParcelStatus(req.params.id, { status });
    if (!updated) return res.status(404).json({ ok: false, error: 'not_found' });
    await logAudit({ action: 'parcel_status_update', parcelId: req.params.id, boxId: updated.boxId, meta: { status } });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    if (e.message === 'invalid_status') return res.status(400).json({ ok: false, error: 'invalid_status' });
    return res.status(500).json({ ok: false, error: 'update_failed' });
  }
});

// Notify recipient with a one-time QR key (SMS and/or email)
router.post('/:id/notify', notifyLimiter, requireAuth, async (req, res) => {
  const { phone = null, email = null, ttlSeconds = Number(process.env.QR_TTL_SECONDS || 900) } = req.body || {};
  if (!phone && !email) return res.status(400).json({ ok: false, error: 'recipient contact required' });
  const parcel = await getParcel(req.params.id);
  if (!parcel) return res.status(404).json({ ok: false, error: 'not_found' });
  const key = await generateQrKey({ boxId: parcel.boxId, ttlSeconds });
  const text = `Your parcel is ready. One-time key (expires ${new Date(key.exp).toLocaleString()}):\n${key.payload}`;
  const results = {};
  if (phone) results.sms = await sendSMS({ to: phone, body: text });
  if (email) results.email = await sendEmail({ to: email, subject: 'Your SCB Pickup Key', text });
  // Optionally mark as notified if any channel succeeded
  if (results.sms?.ok || results.email?.ok) await updateParcelStatus(req.params.id, { status: 'notified' });
  return res.json({ ok: true, data: { qr: { payload: key.payload, exp: key.exp }, sent: results } });
});

export default router;
