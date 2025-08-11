import { Router } from 'express';
import { createBox, getBox, updateBoxState } from '../lib/db.js';
import { logAudit } from '../lib/audit.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { id, ownerUid = null, location = null } = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'id required' });
  const existing = await getBox(id);
  if (existing) return res.status(409).json({ ok: false, error: 'box_exists' });
  const box = await createBox({ id, ownerUid, location });
  await logAudit({ action: 'box_registered', boxId: box.id, meta: { ownerUid, location } });
  return res.json({ ok: true, data: box });
});

router.get('/:id', async (req, res) => {
  const box = await getBox(req.params.id);
  if (!box) return res.status(404).json({ ok: false, error: 'not_found' });
  return res.json({ ok: true, data: box });
});

router.patch('/:id/state', async (req, res) => {
  const { state, battery = null, lastSeen = null } = req.body || {};
  if (!state && battery === null && lastSeen === null) return res.status(400).json({ ok: false, error: 'no_fields' });
  try {
    const updated = await updateBoxState(req.params.id, { state, battery, lastSeen });
    if (!updated) return res.status(404).json({ ok: false, error: 'not_found' });
    await logAudit({ action: 'box_state_update', boxId: req.params.id, meta: { state, battery, lastSeen } });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    if (e.message === 'invalid_state') return res.status(400).json({ ok: false, error: 'invalid_state' });
    return res.status(500).json({ ok: false, error: 'update_failed' });
  }
});

export default router;
