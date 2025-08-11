import request from 'supertest';
import app from '../server.js';

function post(path, body) {
  return request(app).post(path).set('content-type', 'application/json').send(body);
}

function patch(path, body) {
  return request(app).patch(path).set('content-type', 'application/json').send(body);
}

describe('Boxes and Parcels', () => {
  it('registers a box, updates state, creates a parcel and updates status', async () => {
    const id = 'BOX-TEST-1';
    const reg = await post('/api/boxes/register', { id, ownerUid: 'u1', location: 'lab' });
    expect(reg.status).toBe(200);
    expect(reg.body.ok).toBe(true);

    const getRes = await request(app).get(`/api/boxes/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(id);

    const upd = await patch(`/api/boxes/${id}/state`, { state: 'unlocked', battery: 95 });
    expect(upd.status).toBe(200);
    expect(upd.body.data.state).toBe('unlocked');

    const parcel = await post('/api/parcels', { boxId: id, recipientUid: 'user-rec-1' });
    expect(parcel.status).toBe(200);
    const parcelId = parcel.body.data.id;

    const updParcel = await patch(`/api/parcels/${parcelId}/status`, { status: 'deposited' });
    expect(updParcel.status).toBe(200);
    expect(updParcel.body.data.status).toBe('deposited');
  });
});
