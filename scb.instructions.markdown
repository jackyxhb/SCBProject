# SCB Project Context for VS Code AI Agent

**File Name:** scb-ai-context.md  
**Version:** 1.0  
**Date:** August 12, 2025  
**Purpose:** This file provides comprehensive context for AI agents (e.g., GitHub Copilot, Cursor) in VS Code to assist with development of the Smart Courier Box (SCB) project. Use this as a reference for code suggestions, debugging, refactoring, and feature implementation. When generating code, prioritize security (e.g., QR encryption), scalability, and alignment with project goals.

## Project Overview
The SCB is a secure, battery-powered delivery box to prevent parcel theft. Key features:
- **User Registration:** Web platform for unique IDs and QR codes.
- **Delivery Process:** Courier scans QR to open box, places parcel, box locks and generates encrypted QR key (expires after use/time). Recipient notified via SMS/email.
- **Retrieval:** Recipient scans QR key to unlock.
- **Security:** Public/private key encryption; no external power/internet reliance.
- **Prototype Goals:** Functional model + browser simulation for investors.
- **Risks:** Hardware failures, cybersecurity, user adoption. Mitigate with encryption, alternatives (PIN/NFC), and agile retrospectives.

**Business Goals:** Reduce theft (4.2M parcels lost/year in AU/NZ), cut costs ($129/incident), enable 24/7 collection. Market: $14.5B by 2025.

## Tech Stack (FERN)
- **Frontend:** React.js (with Vite for builds) – Responsive UI for registration, dashboard, QR display.
- **Backend:** Express.js + Node.js – APIs for QR generation/validation, parcel tracking, notifications.
- **Database/Auth:** Firebase (Firestore for data, Authentication for users/QR linking).
- **Other:** Raspberry Pi (low-power computer for prototype hardware sim), Solenoid lock, Camera/Screen for QR scanning.
- **Deployment:** Vercel (monorepo: /frontend and /backend). Serverless functions for APIs; static hosting for React.
- **Tools:** Git/GitHub for version control, Trello for Scrum tasks, Jest/Supertest for testing.

**Key Files/Structure:**
- Repo Root: vercel.json, package.json.
- /frontend: src/api.js (API calls), src/components (UI), vite.config.js.
- /backend: server.js (Express app), routes/api.js (endpoints), Firebase admin integration.
- Hardware Sim: Separate scripts for Raspberry Pi (systems programming in Node.js/Python if needed).

## Development Guidelines
- **Coding Standards:**
  - Use ES6+ JavaScript.
  - Follow Airbnb style guide (e.g., semicolons, single quotes).
  - Implement error handling: Always return JSON from APIs (res.json()); log errors.
  - Security: Use helmet.js for Express, validate inputs (Joi/Express-validator), encrypt QR with crypto module.
  - Testing: Write unit tests for APIs/UI (e.g., test QR expiration, auth flows).
- **Feature Implementation Tips:**
  - User Registration: Integrate Firebase Auth; generate QR with qrcode library.
  - QR System: Encrypt with public/private keys (crypto); display on screen via React.
  - Notifications: Use Twilio/Node-mailer for SMS/email (env vars for keys).
  - Battery Sim: Low-power mode – Idle state consumes no power; wake on scan.
  - Simulation: Browser-based demo of delivery/retrieval flow.
- **Agile Practices:** Commit often with descriptive messages (e.g., "feat: add QR encryption"). Reference Trello tickets.
- **Upskilling:** Refer to docs – Firebase (auth/Firestore), React (UI), Express (APIs), OWASP (security).
- **Env Vars:** Use .env files (not committed). Examples: VITE_API_BASE='', FIREBASE_API_KEY, FIREBASE_SERVICE_ACCOUNT.

## Common Issues and Fixes
- **API Returning HTML (Non-JSON):** Fixed via Vercel migration – Routes in vercel.json ensure /api/* hits serverless Express.
- **Firebase Integration Errors:** Check env vars; add Vercel domain to Firebase authorized domains. Use admin SDK backend-only.
- **CORS Issues:** Add cors middleware in Express: `app.use(cors({ origin: process.env.VERCEL_URL }));`.
- **Build Failures:** Ensure Vite distDir matches vercel.json; run `npm run build` locally.
- **QR/Encryption Bugs:** Test with crypto: Generate keys, encrypt/decrypt strings.
- **Deployment:** Push to GitHub triggers Vercel; verify logs for cold starts (mitigate with min-instances if needed).

## Vercel-Specific Deployment Context
- **vercel.json Example:** (As above) – Builds frontend statically, backend as Node functions.
- **Env Setup:** Dashboard > Environment Variables – Add Firebase configs.
- **Testing:** `vercel dev` locally; verify JSON responses in browser Network tab.
- **Hardening:** Add runtime checks (e.g., warn if env missing); enable Vercel Analytics.

## AI Agent Prompts/Usage
- When suggesting code: "Implement secure QR generation endpoint in Express with Firebase."
- Debugging: "Fix this CORS error in the backend."
- Refactoring: "Optimize React component for parcel tracking UI."
- Always cross-reference project goals (e.g., cost efficiency, self-dependence).

This context enables efficient assistance. Update as project evolves. For questions, reference proposal PDF or team contract.