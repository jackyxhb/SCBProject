import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let memoizedKeys = null;

function loadKeysFromEnv() {
  const priv = process.env.QR_PRIVATE_KEY;
  const pub = process.env.QR_PUBLIC_KEY;
  if (priv && pub) return { privateKey: priv, publicKey: pub };
  return null;
}

function loadKeysFromFiles() {
  const dir = process.env.QR_KEY_DIR || path.resolve(process.cwd(), '.keys');
  const publicPath = process.env.QR_PUBLIC_KEY_FILE || path.join(dir, 'public.pem');
  const privatePath = process.env.QR_PRIVATE_KEY_FILE || path.join(dir, 'private.pem');
  try {
    if (fs.existsSync(publicPath) && fs.existsSync(privatePath)) {
      const publicKey = fs.readFileSync(publicPath, 'utf8');
      const privateKey = fs.readFileSync(privatePath, 'utf8');
      if (publicKey && privateKey) return { publicKey, privateKey };
    }
  } catch (_) {
    // ignore and fall back
  }
  return null;
}

function shouldPersist() {
  // Opt-in only: set QR_PERSIST_KEYS=1 to write generated keys to disk (dev convenience)
  return process.env.QR_PERSIST_KEYS === '1';
}

function persistKeysToFiles(keys) {
  const dir = process.env.QR_KEY_DIR || path.resolve(process.cwd(), '.keys');
  const publicPath = process.env.QR_PUBLIC_KEY_FILE || path.join(dir, 'public.pem');
  const privatePath = process.env.QR_PRIVATE_KEY_FILE || path.join(dir, 'private.pem');
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(publicPath, keys.publicKey, { encoding: 'utf8', mode: 0o600 });
    fs.writeFileSync(privatePath, keys.privateKey, { encoding: 'utf8', mode: 0o600 });
  } catch (_) {
    // non-fatal if persistence fails
  }
}

export function ensureKeyPair() {
  if (memoizedKeys) return memoizedKeys;
  const envKeys = loadKeysFromEnv();
  if (envKeys) {
    memoizedKeys = envKeys;
    return memoizedKeys;
  }
  const fileKeys = loadKeysFromFiles();
  if (fileKeys) {
    memoizedKeys = fileKeys;
    return memoizedKeys;
  }
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  memoizedKeys = { publicKey, privateKey };
  if (shouldPersist()) persistKeysToFiles(memoizedKeys);
  return memoizedKeys;
}

export function encryptPayload(payloadObj) {
  const { publicKey } = ensureKeyPair();
  const data = Buffer.from(JSON.stringify(payloadObj), 'utf8');
  const enc = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    data,
  );
  return enc.toString('base64');
}

export function decryptPayload(base64Payload) {
  const { privateKey } = ensureKeyPair();
  const buf = Buffer.from(base64Payload, 'base64');
  const dec = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buf,
  );
  return JSON.parse(dec.toString('utf8'));
}
