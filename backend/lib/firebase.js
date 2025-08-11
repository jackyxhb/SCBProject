import admin from 'firebase-admin';

function parsePrivateKey(key) {
  if (!key) return undefined;
  // Support env-delivered keys with escaped newlines
  return key.replace(/\\n/g, '\n');
}

let app = null;

export function getFirebaseAdmin() {
  if (app) return admin;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    return null; // Not configured
  }

  try {
    app = admin.apps.length ? admin.app() : admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } catch (e) {
    // If initialization fails, remain null
    return null;
  }

  return admin;
}
