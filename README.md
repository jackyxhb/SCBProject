# SCBProject
Smart Courier Box (SCB) monorepo: backend (Express), frontend (React), mobile (Expo/React Native), and device (Raspberry Pi/Node).

## Getting started

Prereqs: Node.js 20+, npm.

Install per package (run inside each folder):
- Backend: `web-app/backend`
	- Install: npm i
	- Run: npm start (PORT=3001)
	- Dev: npm run dev
	- Lint: npm run lint; Format: npm run format:write
- Frontend: `web-app/frontend` (placeholder)
	- Install: npm i
	- Start: npm start (scaffold Vite/CRA in future)
	- Lint/Format: npm run lint / npm run format:write
- Mobile (Expo): `mobile-app/SCBApp`
	- Install: npm i
	- Start: npm run start
	- Lint/Format: npm run lint / npm run format:write
	- Copy `firebase.example.js` to `firebase.js` and fill config (do not commit `firebase.js`).
- Device (Raspberry Pi or mock): `device-software`
	- Install: npm i
	- Start (mock GPIO on non-Linux): npm run start:mock
	- Health: npm run health
	- Unlock demo: npm run unlock:demo
	- Lint/Format: npm run lint / npm run format:write

## Environment variables

Backend (web-app/backend):
- FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (escaped \n) or FIREBASE_PRIVATE_KEY_PATH
- Optional: PORT (default 3001)

Mobile (mobile-app/SCBApp):
- Create `firebase.js` from `firebase.example.js` with your client config.

Device (device-software):
- DEVICE_PORT (default 4001)
- SCB_MOCK_GPIO=1 to force mock GPIO (non-Linux default)
- DEV_ACCEPT_ANY=1 accepts any QR on /scan (development only; never set in production)
- ACTIVE_LOW=1 if your solenoid uses active-low wiring (future option)

## GPIO safety notes

- Validate pin numbers and wiring before running on hardware.
- Default state should keep the solenoid locked (LOW by default unless ACTIVE_LOW is used).
- Clamp unlock duration; avoid holding the solenoid energized for long periods to prevent overheating.
- Never expose the device HTTP API to untrusted networks without authentication.

## CI and code quality

- GitHub Actions workflow runs install, lint, and test for each package on PRs to main.
- ESLint/Prettier enforce 2-space indent, single quotes, semicolons.

## Security

- Do not commit secrets or `firebase.js` for the mobile app.
- Replace Firestore rules with least-privilege rules before production.
