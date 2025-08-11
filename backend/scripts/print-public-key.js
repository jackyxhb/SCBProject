import fs from 'fs';
import path from 'path';
import { ensureKeyPair } from '../lib/crypto.js';

const { publicKey } = ensureKeyPair();

const outPath = process.env.PUBLIC_KEY_OUT || '';

if (outPath) {
  const dir = path.dirname(outPath);
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(outPath, publicKey, { encoding: 'utf8', mode: 0o644 });
    console.log(outPath);
  } catch (e) {
    console.error(`Failed to write public key to ${outPath}:`, e.message);
    console.log(publicKey);
  }
} else {
  console.log(publicKey);
}
