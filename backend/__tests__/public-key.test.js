import request from 'supertest';
import app from '../server.js';

describe('GET /api/qr/public-key', () => {
  it('returns PEM public key', async () => {
    const res = await request(app).get('/api/qr/public-key');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const pem = res.body?.data?.publicKey || '';
    expect(pem).toContain('BEGIN PUBLIC KEY');
    expect(pem).toContain('END PUBLIC KEY');
  });
});
