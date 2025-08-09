import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import '../device.js';

const port = Number(process.env.DEVICE_PORT || 4001);

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, json: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('device /health returns ok', async () => {
  const res = await get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.json.ok, true);
});
