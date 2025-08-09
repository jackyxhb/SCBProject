import express from 'express';
import { admin, db, initialized as fbReady } from './firebaseAdmin.js';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, firebase: fbReady }));

// Placeholder delivery endpoint shape per repo instructions
// POST /delivery -> verify courier QR, write parcel state, return recipient QR (data URL)
app.post('/delivery', (req, res) => {
  const { qrData, parcelId } = req.body || {};
  if (!qrData || !parcelId) return res.status(400).json({ error: 'qrData and parcelId required' });
  // If Firebase isn't configured yet, return stubbed response
  if (!fbReady) {
    return res.json({ message: 'stub (firebase not configured)', recipientQrDataUrl: 'data:image/png;base64,stub' });
  }
  // TODO: validate QR, write Firestore, generate QR via `qrcode`
  return res.json({ message: 'stub', recipientQrDataUrl: 'data:image/png;base64,stub' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`SCB backend listening on :${port}`));
