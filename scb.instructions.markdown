# Instructions for VS Code AI Agent: SCB Project Development

This document serves as a comprehensive guide for the AI agent (e.g., GitHub Copilot, Cursor, or similar VS Code extensions) to assist in developing the Smart Courier Box (SCB) project. The AI agent must use this file as the primary reference for project structure, requirements, tech stack, and best practices. When generating code, debugging, or refactoring, align with the details below to ensure consistency, security, and adherence to project goals. The current date and time is 11:22 PM NZST, August 9, 2025, placing the project in Phase 3, Sprint 2 (iterative development and testing).

## Project Overview  
The Smart Courier Box (SCB) is a secure, semi-automated delivery system to prevent parcel theft and misplacement. It features a lockable box with QR-based authentication for deliveries and retrievals, is battery-operated, energy-efficient, and uses encryption for security. Deliverables include a functional prototype and a web-based simulation for investor presentations, scalable for residential and multi-residence use.

- **Client**: Parma Nand (startup at Technology Readiness Level 3).  
- **Team**: 
  - Scrum Master: Riley Baxter  
  - Product Owners (Rotational): Marlon Gao, Troy Meredith  
  - Developers: 
    - Frontend: Jackson, Troy (React.js, React Native)  
    - Backend: Marlon, Simon, Frank (Express.js, Node.js, Firebase)  
- **Timeline**: March 3, 2025 – November 14, 2025 (currently in Phase 3, Sprint 2).  
- **Budget**: $339,960 (prioritize cost-efficiency).  
- **Market Context**: Targets e-commerce growth in NZ/Australia (9.8% annual), reducing $129 average loss per stolen package.

## Project Goals and Scope  
1. Secure package deliveries with a lockable box and QR-based authentication.  
2. User-friendly: 24/7 access without recipient presence.  
3. Scalable: Suitable for single homes and apartment buildings.  
4. Prototype: Functional model + browser-based simulation for investors.  
5. Self-dependent: Battery-powered (6-month life), offline-capable with encryption.  
6. Security: Public/private key encryption for QR codes; single-use/expiring codes.  

**Out of Scope**: Full production manufacturing, advanced AI integrations (unless specified in Sprint 2 or 3).  

## High-Level Functionalities  
- **User Registration**: Web platform for user ID/QR code generation, linked to addresses (Firebase Auth/Firestore).  
- **Delivery Process**: 
  - Courier scans user’s QR to open box, places parcel, box locks.  
  - Generates new QR key (displayed on SCB screen, scanned by courier).  
  - Sends SMS/Email notification to recipient with QR key.  
- **Retrieval**: Recipient scans QR key to unlock box.  
- **Hardware**: Solenoid lock, QR camera, LCD screen, Raspberry Pi for control.  
- **Simulation**: Web-based demo of delivery/retrieval flows.  

## Tech Stack (FERN)  
- **Frontend**: 
  - Web: React.js (responsive dashboard for registration/simulation).  
  - Mobile: React Native (v0.78.0, for QR scanning, notifications on iOS/Android).  
- **Backend**: Express.js with Node.js (v24.1.0, API for QR handling, notifications).  
- **Database/Authentication**: Firebase (Spark plan; Authentication for sign-ins, Firestore for users/parcels/QRs).  
- **Device Software**: Node.js or Python on Raspberry Pi (GPIO control, QR processing).  
- **Libraries**: 
  - QR: `qrcode` (generation), `react-native-qrcode-scanner`, `react-native-camera` (scanning).  
  - Encryption: Node.js `crypto` module or `firebase-admin` for secure keys.  
  - Hardware: `onoff` (GPIO), `rpi-camera` (Raspberry Pi camera).  
  - Testing: Jest for unit tests.  
  - Deployment: Firebase Hosting (web), pm2 (device services).  
- **Version Control**: Git/GitHub (feature branches, PR reviews).  
- **Project Management**: Scrum (3 sprints; use Trello for backlog).  

## Project Structure  
Root directory: `SCB-Project/`. Use as the VS Code workspace.  

```
SCB-Project/
├── web-app/                # Web application
│   ├── backend/            # Express.js API
│   │   ├── index.js        # Main server (user registration, QR APIs)
│   │   ├── .env            # Firebase keys (gitignore)
│   │   └── package.json
│   └── frontend/           # React.js app
│       ├── src/            # Components (e.g., Register.js, Simulation.js)
│       ├── public/
│       └── package.json
├── mobile-app/             # React Native app
│   ├── SCBApp/             # Initialized project
│   │   ├── App.js          # QR scanner, notifications
│   │   ├── android/
│   │   ├── ios/
│   │   └── package.json
├── device-software/        # Raspberry Pi code
│   ├── device.js           # GPIO, QR processing, solenoid control
│   └── package.json
├── docs/                   # Project docs (e.g., this file, Proposal ver1.1.pdf)
├── .gitignore              # Ignore node_modules, .env, builds
└── README.md               # Project setup guide
```

## Development Guidelines for AI Agent  
- **Code Style**: Use ESLint/Prettier (semi-colons, single quotes, 2-space indentation). Prefer functional React components with hooks.  
- **Security**: 
  - Encrypt QR data using public/private keys (e.g., `crypto.createHash('sha256')`).  
  - Validate inputs to prevent SQL injection/XSS.  
  - Firestore rules example:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```
- **Offline/Low-Power**: 
  - Device: Implement sleep modes (e.g., cron on Raspberry Pi); poll QR camera every 1-2 seconds.  
  - Mobile/Web: Enable Firestore offline persistence (`firebase.firestore().enablePersistence()`).  
- **Testing**: Suggest Jest unit tests for APIs (e.g., `/register`, `/delivery`) and components. Cover edge cases (expired QRs, invalid scans).  
- **Risk Mitigation**: 
  - Address risks from proposal (e.g., R-001: Elderly users – suggest PIN/NFC alternatives).  
  - Hardware risks (R-007: Data breach, R-008: Auth failure): Suggest redundant auth methods, encryption.  
- **Agile Alignment**: Focus on Sprint 2 goals (iterative dev, user stories, e.g., QR scanning, lock control).  
- **Mentor Reporting**: Generate code for weekly progress reports stored in Firestore for project mentor review (no specific email).  
  - Example:
    ```javascript
    // backend/index.js
    const saveReport = async () => {
      const report = await admin.firestore().collection('progress').get();
      await admin.firestore().collection('progress').add({
        timestamp: new Date(),
        data: report.docs.map(doc => doc.data()),
      });
      console.log('Weekly report saved for mentor review');
    };
    ```
- **Upskilling**: Include comments with resource links (e.g., https://firebase.google.com/docs/auth, https://react.dev).  
- **Error Handling**: Use try/catch; log errors with context (e.g., `console.error('QR Scan Failed:', error)`).  
- **Performance**: Minimize device power draw (e.g., disable screen when idle). Optimize API calls (e.g., batch Firestore writes).  

## How the AI Agent Should Assist  
1. **Code Generation**: 
   - Suggest snippets for features (e.g., “Implement delivery endpoint” → provide `/delivery` route):
     ```javascript
     // backend/index.js
     /**
      * POST /delivery - Register parcel delivery
      * @param {string} qrData - Scanned QR code
      * @param {string} parcelId - Parcel identifier
      * @returns {object} New QR key for recipient
      */
     app.post('/delivery', async (req, res) => {
       try {
         const { qrData, parcelId } = req.body;
         const userDoc = await admin.firestore().collection('users').where('qrCode', '==', qrData).get();
         if (userDoc.empty) return res.status(401).json({ error: 'Invalid QR' });
         const newQrKey = `parcel:${parcelId}|key:${Date.now()}`; // Single-use
         const qrCode = await QRCode.toDataURL(newQrKey);
         await admin.firestore().collection('parcels').doc(parcelId).set({ status: 'delivered', qrKey });
         // TODO: Send SMS/Email to user with qrKey
         res.json({ qrKey: qrCode });
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     });
     ```
2. **Debugging**: 
   - Analyze errors (e.g., React Native CLI issues) and suggest fixes, referencing risks (e.g., R-008: Auth failure).  
   - Example: For “cli.init is not a function”, suggest `npm uninstall -g react-native-cli && npx react-native init SCBApp --version 0.78.0`.  
3. **Refactoring**: Optimize for security/performance (e.g., “Refactor QR scan for offline” → add Firestore offline support).  
4. **Documentation**: Auto-generate JSDoc comments. Suggest README updates for mentor review.  
5. **Queries**: Answer questions like “Add QR scanning in React Native” with SCB-specific code:
   ```javascript
   // mobile-app/SCBApp/App.js
   import { View, Text } from 'react-native';
   import QRCodeScanner from 'react-native-qrcode-scanner';
   import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';

   const App = () => {
     const onScan = async (e) => {
       try {
         const db = getFirestore();
         await updateDoc(doc(db, 'parcels', e.data), { status: 'delivered' });
         alert('Parcel Registered!');
       } catch (error) {
         console.error('QR Scan Failed:', error);
       }
     };

     return (
       <View style={{ flex: 1 }}>
         <QRCodeScanner onRead={onScan} />
         <Text>Scan QR for Delivery</Text>
       </View>
     );
   };
   export default App;
   ```
6. **Context Awareness**: Prioritize this file and Proposal ver1.1.pdf.  
7. **Limitations**: 
   - Stick to FERN stack and listed libraries.  
   - Use Firebase Spark plan (free tier).  
   - Prompt for clarification if needed (e.g., “Need details on mentor reporting requirements”).  

## Example Workflow in VS Code  
1. Open `SCB-Project/` as workspace. Keep this file (`instructions.md`) open.  
2. Enable AI extension (e.g., Copilot) and set to use this file as context.  
3. For tasks, write partial code and let AI complete (e.g., “Add solenoid control” → suggest GPIO logic).  
4. For errors, paste logs into AI chat with “Refer to instructions.md”.  
5. Commit to GitHub: `git commit -m "Added delivery endpoint per Sprint 2"`.  

## Risk Mitigation for AI Agent  
- **R-006 (Absence of Decision-Makers)**: Log decisions to Firestore for mentor review.  
- **R-013 (Team Skills)**: Add comments with doc links (e.g., https://firebase.google.com/docs/firestore).  
- **R-007 (Security)**: Suggest encryption for all QR data (e.g., `crypto.createHash('sha256')`).  

This file ensures the AI agent supports SCB development in Sprint 2. Update post-Sprint 2 (September 22, 2025) to reflect feedback or new priorities. For specific features, query with “Refer to instructions.md”.