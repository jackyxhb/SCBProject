import request from 'supertest';
import app from '../server.js';

describe('GET /api/health', () => {
  it('returns ok:true JSON', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
