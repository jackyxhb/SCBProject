import request from 'supertest';
import app from '../server.js';

function post(path, body) {
  return request(app).post(path).set('content-type', 'application/json').send(body);
}

describe('QR flow', () => {
  it('generates an encrypted QR and validates it once', async () => {
    const gen = await post('/api/qr/generate', { boxId: 'BOX123', ttlSeconds: 5 });
    expect(gen.status).toBe(200);
    expect(gen.body.ok).toBe(true);
    const { payload } = gen.body.data.qr;
    expect(typeof payload).toBe('string');

    const val1 = await post('/api/qr/validate', { payload });
    expect(val1.status).toBe(200);
    expect(val1.body.ok).toBe(true);

    const val2 = await post('/api/qr/validate', { payload });
    expect(val2.status).toBe(400);
    expect(val2.body.ok).toBe(false);
    expect(val2.body.error).toBe('consumed');
  });

  it('rejects expired keys', async () => {
    const gen = await post('/api/qr/generate', { boxId: 'BOX123', ttlSeconds: 0 });
    const { payload } = gen.body.data.qr;
    const val = await post('/api/qr/validate', { payload });
    expect(val.status).toBe(400);
    expect(val.body.error).toBe('expired');
  });
});
