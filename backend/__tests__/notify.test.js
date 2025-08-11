import request from 'supertest';
import app from '../server.js';

function post(path, body) {
  return request(app).post(path).set('content-type', 'application/json').send(body);
}

describe('Notify flow (no external creds)', () => {
  it('creates parcel and calls notify; marks notified only if channel ok', async () => {
    const boxId = 'BOX-NOTIFY-1';
    await post('/api/boxes/register', { id: boxId });
    const parcel = await post('/api/parcels', { boxId, recipientUid: 'u1' });
    const parcelId = parcel.body.data.id;

    // No Twilio/SMTP creds in tests; endpoint should still return ok with reasons
    const res = await post(`/api/parcels/${parcelId}/notify`, { phone: '+10000000000', email: 'test@example.com', ttlSeconds: 30 });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.sent.sms?.ok || false).toBe(false);
    expect(res.body.data.sent.email?.ok || false).toBe(false);
  });
});
