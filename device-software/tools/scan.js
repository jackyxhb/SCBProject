#!/usr/bin/env node
import http from 'node:http';

const port = Number(process.env.DEVICE_PORT || 4001);
const host = process.env.DEVICE_HOST || '127.0.0.1';
const payload = process.argv[2] || process.env.QR || 'VALID:demo';
const unlockMs = Math.max(0, Number(process.argv[3] || process.env.UNLOCK_MS || 3000));

function post(path, json) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(json));
    const req = http.request({ host, port, path, method: 'POST', headers: {
      'Content-Type': 'application/json',
      'Content-Length': String(data.length)
    } }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

try {
  const res = await post('/scan', { qr: payload, unlockMs });
  console.log(res.data);
  process.exit(res.status === 200 ? 0 : 1);
} catch (err) {
  console.error('Scan request failed:', err?.message || err);
  process.exit(1);
}
