// Firebase Admin bootstrap. No-ops when env is missing so local dev isn’t blocked.
import fs from 'node:fs';

export let admin = null;
export let db = null;
export let initialized = false;

const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL'];
const hasAll = required.every((k) => process.env[k]);
const keyPath = process.env.FIREBASE_PRIVATE_KEY_PATH;
const keyEnv = process.env.FIREBASE_PRIVATE_KEY; // literal key (\n preserved)

function loadPrivateKey() {
  if (keyEnv) return keyEnv.replace(/\\n/g, '\n');
  if (keyPath && fs.existsSync(keyPath)) return fs.readFileSync(keyPath, 'utf8');
  return null;
}

if (hasAll) {
  try {
    const privateKey = loadPrivateKey();
    if (!privateKey) throw new Error('Missing FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_PATH');
    const mod = await import('firebase-admin');
    admin = mod.default;
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
    db = admin.firestore();
    initialized = true;
  } catch (e) {
    console.warn('Firebase Admin not initialized:', e?.message || e);
    admin = null;
    db = null;
    initialized = false;
  }
}
