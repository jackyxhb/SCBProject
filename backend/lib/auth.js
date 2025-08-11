import { getFirebaseAdmin } from './firebase.js';

const admin = getFirebaseAdmin();
const requireAuthFlag = process.env.REQUIRE_AUTH === '1';

export async function attachUser(req, _res, next) {
  req.user = null;
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (admin && token) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = decoded;
    } catch (_) {
      // ignore invalid tokens; handled by requireAuth if enabled
    }
  }
  return next();
}

export function requireAuth(req, res, next) {
  if (!requireAuthFlag) return next();
  if (req.user) return next();
  return res.status(401).json({ ok: false, error: 'unauthorized' });
}
