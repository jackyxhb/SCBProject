# SCBProject — AI Coding Agent Instructions

Use this as your quick-start context for the Smart Courier Box (SCB) repo. Prefer concrete patterns from this repo’s docs over generic advice.

## What to read first
- Primary source: `scb.instructions.markdown` (project vision, stack, workflows, security). Keep it in context when coding.
- `README.md` is minimal and not authoritative.

## Architecture at a glance
- Stack (FERN): React (web), React Native (mobile), Express/Node (API), Firebase (Auth + Firestore). Device: Raspberry Pi (Node.js) for GPIO, QR camera, solenoid.
- Planned components and flows:
  - Web/Frontend: user registration + investor simulation UI.
  - Backend/API: QR generation/validation, parcel lifecycle, notifications.
  - Mobile: QR scanning and user actions (delivery/retrieval).
  - Device: lock control + local QR scan loop; low-power friendly.
- Data flow (core loop): courier scans QR → backend verifies → device unlocks → parcel placed → backend issues single-use QR → recipient notified → recipient scans to unlock for retrieval.

## Repo conventions and structure (planned)
- Follow this structure when scaffolding code:
  - `web-app/backend/` (Express API: `index.js`, `.env`, `package.json`)
  - `web-app/frontend/` (React app: `src/`, `public/`, `package.json`)
  - `mobile-app/SCBApp/` (React Native: `App.js`, `android/`, `ios/`; Expo is acceptable if native toolchains aren’t available)
  - `device-software/` (Raspberry Pi code: `device.js`, `package.json`)
- Code style: ESLint/Prettier, 2-space indent, single quotes, semicolons. Functional React with hooks.
- Secrets: never commit `.env` (Firebase keys, API secrets). Keep Firestore rules tight.

## Security and invariants
- QR payloads are single-use/short-lived and must be derived/validated server-side; prefer Node `crypto` for hashing/signing.
- Firestore rules must scope reads/writes to the authenticated user. Example policy lives in `scb.instructions.markdown`.
- Device and mobile should support offline behavior; minimize power draw on device.

## Patterns and examples (use these shapes)
- Backend endpoint (Express) for registering a delivery and issuing a new recipient QR:
  - File: `web-app/backend/index.js`
  - Pattern (trimmed): create POST `/delivery` that verifies courier QR → writes parcel state in Firestore → returns data URL QR for recipient.
- Mobile QR scan handler (React Native):
  - File: `mobile-app/SCBApp/App.js`
  - Pattern (trimmed):
    - Bare React Native: use `react-native-qrcode-scanner` (and its camera peer).
    - Expo workflow: use `expo-barcode-scanner` to read QR; on scan, update Firestore parcel status and provide immediate feedback.
- Device loop: poll camera at low frequency (1–2s), drive GPIO for solenoid via `onoff`; sleep when idle.

## Developer workflows
- Branching/PRs: feature branches with PR review.
- Testing: Jest for API and UI units; cover expired/invalid QR and auth failures.
- Envs: Use `.env` for Firebase; keep local emulator/support optional if added later.
 - CI: GitHub Actions recommended. For Node workspaces under `web-app/backend`, `web-app/frontend`, `mobile-app/SCBApp`, and `device-software`, set up a simple workflow per package to install deps, lint, and run tests on `ubuntu-latest` with Node LTS. Trigger on PRs to `main`.

## Integration points
- Firebase: Auth for sign-in, Firestore for users/parcels/progress; consider `enablePersistence()` on web/mobile.
- QR: `qrcode` for generation; scanning via `react-native-qrcode-scanner` (bare) or `expo-barcode-scanner` (Expo).
- Hardware (Raspberry Pi): `onoff` for GPIO; camera lib as available.

## When implementing new code
- Mirror the planned structure above and reference file paths exactly.
- Reuse the example shapes from “Patterns and examples” and adapt to the specific feature.
- Keep security invariants (single-use QR, validation server-side, strict rules) and low-power constraints in mind.

Questions or gaps? Open an issue or update `scb.instructions.markdown`. Device is Node.js-first; prefer Expo-compatible mobile choices when native iOS/Android toolchains aren’t present.
