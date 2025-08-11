# SCBProject — Copilot working guide

This file makes AI agents productive fast in this repo by summarizing the essential, project-specific practices. Source of truth: `README.md`, `scb.instructions.markdown`, and `.github/instructions/scb.instructions.md`.

## Big picture
- Product: Smart Courier Box (SCB) — secure, battery-powered delivery box with QR-based access and no reliance on mains power/always-on internet.
- Architecture (FERN): React (Vite) frontend + Express/Node backend + Firebase (Auth/Firestore) + Vercel deploy; Raspberry Pi prototype for lock/scan simulation.
- Core flows: (1) Register user → issue unique ID + QR; (2) Courier scans QR to unlock → deposit → box locks → backend generates encrypted one-time QR key and notifies recipient; (3) Recipient scans key to unlock; all operations time-bound and auditable.

## Repo shape to expect (create if missing)
- Root: `vercel.json`, `package.json`, `.env*` (never commit secrets).
- Frontend: `/frontend` with `src/api.js`, `src/components/**`, `vite.config.js`; uses `VITE_API_BASE` for backend URL.
- Backend: `/backend` with `server.js`, `routes/api.js`, Firebase Admin init; all endpoints return JSON.
- Hardware sim: prototype scripts for Raspberry Pi (Node/Python) to drive solenoid, camera/scanner, screen.

## Day-to-day workflows
- Local dev: Vite for UI; Express APIs; optional `vercel dev` to run both and mirror serverless routing.
- Tests: Jest + Supertest for backend; component/unit tests for UI (focus on QR expiry, auth, and API contracts).
- Env: use `.env`/Vercel env for `VITE_API_BASE`, Firebase client keys (frontend), Firebase Admin service account (backend), Twilio/SMTP creds.
- Deploy: push to `main` → Vercel builds; backend as Node serverless functions, frontend as static site.

## Conventions and patterns
- JS/TS style: ES6+, Airbnb-ish formatting; semicolons, single quotes, small pure functions.
- API rules: JSON only, consistent shapes `{ ok, data?, error? }`; validate inputs (Joi/express-validator); secure headers (helmet); CORS configured to Vercel URL.
- Security: QR payloads are encrypted with Node `crypto` (public/private key); keys are one-time and time-limited; never expose Admin SDK client-side.
- Frontend data access: centralize fetches in `frontend/src/api.js`; pass auth tokens from Firebase Auth when required.

## Integration points
- Firebase: Auth (user identity/claims), Firestore (parcel/box state, QR issuance/consumption). Admin SDK on backend only.
- Notifications: Twilio (SMS) and/or nodemailer (email) driven by backend on delivery events.
- Vercel: `vercel.json` routes `/api/*` → backend functions; align Vite `dist` with Vercel config.

## Common gotchas (from history)
- API returning HTML: ensure requests hit serverless routes via `vercel.json` and that endpoints `res.json(...)` always.
- CORS: set `cors({ origin: process.env.VERCEL_URL })` (or explicit allowlist) before routes.
- Firebase auth errors: verify authorized domains and env; Admin SDK credentials must exist in Vercel env for backend.
- Build mismatches: keep Vite output dir consistent with Vercel; test locally before deploy.
- QR correctness: include tests for key generation, expiry, single-use consumption, and decrypt/verify cycle.

## Examples to mirror
- Endpoints: `POST /api/qr/generate` (auth required), `POST /api/qr/validate`, `POST /api/notify/recipient`.
- Data model (Firestore, indicative): collections `users`, `boxes`, `parcels`, `qrKeys` with TTL/consumed flags and minimal PII.
- Frontend: show QR as canvas/SVG; poll or subscribe (Firestore) for delivery state changes.

If adding new features, align with the flows above, keep endpoints JSON+validated, and thread secrets via env only. When uncertain, consult `scb.instructions.markdown` for fuller context and mirror its patterns.
