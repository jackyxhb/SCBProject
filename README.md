# SCBProject

Smart Courier Box (SCB) — secure, battery-powered delivery box with QR-based access.

## Quickstart

Prereqs: Node 18+.

Install dependencies (root + workspaces) and run both apps:

```
npm install
npm run dev
```

- UI: http://localhost:5173
- API: http://localhost:3000/api/health

## Structure

- frontend/ — React (Vite)
- backend/ — Express API
- vercel.json — routes /api/* to backend and serves frontend/dist

## CI status

![CI](https://github.com/jackyxhb/SCBProject/actions/workflows/ci.yml/badge.svg)

## Tests

Backend tests:

```
npm -w backend test
```

## Deploying to Vercel

This repo is set up to deploy as:
- Serverless Node backend at /api/* using `backend/server.js`.
- Static frontend built with Vite from `frontend/dist`.

Steps:
1. Push the repo to GitHub.
2. In Vercel, import the project and select this repository.
3. Build command: `npm run vercel-build`.
4. Output directory: `frontend/dist` (handled via `vercel.json`).
5. Set required environment variables in Vercel (Project Settings → Environment Variables):
	- Frontend: `VITE_API_BASE=/api`
	- Backend: any needed from `.env.example` (Firebase Admin, notifications, auth flags, rate limits, etc.)
6. Deploy. API routes are served under `/api/*`; all other routes serve the SPA `index.html`.

Notes:
- The backend will not call `app.listen()` on Vercel functions; it only exports the Express app.
- Toggle Firestore with `USE_FIRESTORE=1` when Firebase Admin is configured.
## Env

Copy .env.example files and set values as needed. Never commit real secrets.
