import React from 'react';
import { api } from './api.js';

export default function App() {
  const [status, setStatus] = React.useState('');
  const [boxId, setBoxId] = React.useState('BOX123');
  const [ttl, setTtl] = React.useState(300);
  const [qr, setQr] = React.useState(null);
  const [validation, setValidation] = React.useState(null);
  const [publicKey, setPublicKey] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [parcelBoxId, setParcelBoxId] = React.useState('BOX123');
  const [recipientUid, setRecipientUid] = React.useState('user1');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [lastParcel, setLastParcel] = React.useState(null);
  const [notifyResult, setNotifyResult] = React.useState(null);

  React.useEffect(() => {
    api.health().then(setStatus).catch((e) => setStatus(`error: ${e.message}`));
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setValidation(null);
    const data = await api.generateQR({ boxId, ttlSeconds: Number(ttl) });
    setQr(data.qr);
  }

  async function handleValidate() {
    if (!qr?.payload) return;
    const res = await api.validateQR({ payload: qr.payload });
    setValidation(res);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 680 }}>
      <h1>Smart Courier Box</h1>
      <p>Backend status: {status || 'loading…'}</p>

      <form onSubmit={handleGenerate} style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        <label>
          Box ID
          <input value={boxId} onChange={(e) => setBoxId(e.target.value)} style={{ marginLeft: 8 }} />
        </label>
        <label>
          TTL (seconds)
          <input type="number" value={ttl} onChange={(e) => setTtl(e.target.value)} style={{ marginLeft: 8 }} />
        </label>
        <button type="submit">Generate QR payload</button>
      </form>

      {qr && (
        <div style={{ marginTop: 16 }}>
          <h3>QR payload</h3>
          <textarea readOnly value={qr.payload} rows={6} style={{ width: '100%' }} />
          <p>Expires at: {new Date(qr.exp).toLocaleString()}</p>
          <button onClick={handleValidate}>Validate once</button>
        </div>
      )}

      {validation && (
        <div style={{ marginTop: 16 }}>
          <h3>Validation result</h3>
          <pre>{JSON.stringify(validation, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h2>Public key</h2>
        <button onClick={async () => {
          const pem = await api.getPublicKey();
          setPublicKey(pem);
          setCopied(false);
        }}>Fetch public key</button>
        {publicKey && (
          <div style={{ marginTop: 8 }}>
            <textarea readOnly value={publicKey} rows={8} style={{ width: '100%' }} />
            <button onClick={async () => {
              try {
                await navigator.clipboard.writeText(publicKey);
                setCopied(true);
              } catch (_) {
                setCopied(false);
              }
            }}>Copy to clipboard</button>
            {copied && <span style={{ marginLeft: 8 }}>Copied</span>}
          </div>
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        <h2>Parcels</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const p = await api.createParcel({ boxId: parcelBoxId, recipientUid });
          setLastParcel(p);
          setNotifyResult(null);
        }} style={{ display: 'grid', gap: 8 }}>
          <label>Box ID <input value={parcelBoxId} onChange={(e) => setParcelBoxId(e.target.value)} /></label>
          <label>Recipient UID <input value={recipientUid} onChange={(e) => setRecipientUid(e.target.value)} /></label>
          <button type="submit">Create parcel</button>
        </form>

        {lastParcel && (
          <div style={{ marginTop: 12 }}>
            <p>Parcel created: {lastParcel.id} (box: {lastParcel.boxId})</p>
            <div style={{ display: 'grid', gap: 8 }}>
              <label>Notify phone <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1..." /></label>
              <label>Notify email <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="name@example.com" /></label>
              <button onClick={async () => {
                const res = await api.notifyParcel({ parcelId: lastParcel.id, phone: contactPhone || undefined, email: contactEmail || undefined });
                setNotifyResult(res);
              }}>Send notify</button>
            </div>
          </div>
        )}

        {notifyResult && (
          <div style={{ marginTop: 12 }}>
            <h3>Notify result</h3>
            <pre>{JSON.stringify(notifyResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
