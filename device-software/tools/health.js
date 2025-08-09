#!/usr/bin/env node
import http from 'node:http';

const port = Number(process.env.DEVICE_PORT || 4001);
const host = process.env.DEVICE_HOST || '127.0.0.1';

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host, port, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

try {
  const res = await get('/health');
  console.log(res.data);
  process.exit(res.status === 200 ? 0 : 1);
} catch (err) {
  console.error('Health check failed:', err?.message || err);
  process.exit(1);
}
