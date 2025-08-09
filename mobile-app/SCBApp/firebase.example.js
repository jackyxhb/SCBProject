// Example Firebase client init for Expo RN. Copy to firebase.js and fill config once available.
// Using modular SDK to keep bundle size reasonable.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: '<API_KEY>',
  authDomain: '<PROJECT_ID>.firebaseapp.com',
  projectId: '<PROJECT_ID>',
  storageBucket: '<PROJECT_ID>.appspot.com',
  messagingSenderId: '<SENDER_ID>',
  appId: '<APP_ID>'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
