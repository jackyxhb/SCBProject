// SCB device loop (Node.js-first). Placeholder for Raspberry Pi control.
// Poll camera (to be integrated) at low frequency and drive GPIO for solenoid via onoff.

import http from 'node:http';

const isLinux = process.platform === 'linux';
const forceMock = ['1', 'true', 'yes'].includes(String(process.env.SCB_MOCK_GPIO || '').toLowerCase());
const shouldMock = forceMock || !isLinux;

class MockGpio {
  constructor(pin, direction) {
    this.pin = pin; this.direction = direction;
    console.log(`[MOCK GPIO] init pin ${pin} direction ${direction}`);
  }
  writeSync(value) {
    console.log(`[MOCK GPIO] pin ${this.pin} -> ${value}`);
  }
  unexport() {
    console.log(`[MOCK GPIO] unexport pin ${this.pin}`);
  }
}

let GpioImpl;
if (shouldMock) {
  GpioImpl = MockGpio;
  if (!isLinux) {
    console.warn('Running on non-Linux platform; GPIO is mocked. Set SCB_MOCK_GPIO=0 on Raspberry Pi.');
  } else if (forceMock) {
    console.warn('SCB_MOCK_GPIO enabled; GPIO is mocked.');
  }
} else {
  try {
    const onoff = await import('onoff');
    GpioImpl = onoff.Gpio;
  } catch (err) {
    console.warn('Failed to load onoff; falling back to mock GPIO. Error:', err?.message || err);
    GpioImpl = MockGpio;
  }
}

// Example: solenoid on GPIO17 (BCM numbering)
const solenoid = new GpioImpl(17, 'out');

function unlock(ms = 3000) {
  solenoid.writeSync(1);
  setTimeout(() => solenoid.writeSync(0), ms);
}

async function loop() {
  // TODO: integrate camera/QR scan; for now, simulate idle sleep
  // Minimize power usage when idle
  await new Promise((r) => setTimeout(r, 1500));
  // No-op
  return loop();
}

// Minimal HTTP API to control the device locally
const port = Number(process.env.DEVICE_PORT || 4001);
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET' && url.pathname === '/health') {
      res.end(JSON.stringify({ ok: true, platform: process.platform, mock: shouldMock }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/unlock') {
      const ms = Math.max(0, Number(url.searchParams.get('ms') || 3000));
      unlock(ms);
      res.end(JSON.stringify({ ok: true, unlockingMs: ms }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/scan') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; if (body.length > 1e6) req.destroy(); });
      req.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const qr = parsed.qr ?? parsed.payload ?? '';
          if (!qr || typeof qr !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: 'qr (string) required' }));
            return;
          }
          // Simulated verification: accept if startsWith('VALID:') or non-empty when DEV_ACCEPT_ANY=1
          const acceptAny = ['1','true','yes'].includes(String(process.env.DEV_ACCEPT_ANY||'').toLowerCase());
          const verified = acceptAny || qr.startsWith('VALID:');
          if (!verified) {
            res.statusCode = 401;
            res.end(JSON.stringify({ ok: false, verified: false }));
            return;
          }
          const ms = Math.max(0, Number(parsed.unlockMs || 3000));
          unlock(ms);
          res.end(JSON.stringify({ ok: true, verified: true, unlockingMs: ms }));
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'invalid-json' }));
        }
      });
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: (err && err.message) || 'internal' }));
  }
});
server.listen(port, () => console.log(`SCB device HTTP listening on :${port}`));

process.on('SIGINT', () => {
  try { solenoid.writeSync(0); } catch {}
  try { solenoid.unexport(); } catch {}
  process.exit(0);
});

loop();
