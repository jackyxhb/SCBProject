import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const authDisabled = !firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId;
let warned = false;
function warnIfDisabled() {
  if (authDisabled && !warned) {
    console.warn('Firebase Auth disabled: set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID');
    warned = true;
  }
}

let app;
let auth;
let provider;

export function initFirebase() {
  if (authDisabled) {
    warnIfDisabled();
    return null;
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  }
  return { app, auth };
}

export async function getIdToken() {
  if (authDisabled) return null;
  if (!auth) initFirebase();
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
}

export function onAuth(callback) {
  if (authDisabled) {
    warnIfDisabled();
    // return a no-op unsubscribe
    return () => {};
  }
  if (!auth) initFirebase();
  return onAuthStateChanged(auth, callback);
}

export async function signIn() {
  if (authDisabled) {
    warnIfDisabled();
    throw new Error('Auth is disabled: missing Firebase config');
  }
  if (!auth) initFirebase();
  await signInWithPopup(auth, provider);
}

export async function logOut() {
  if (authDisabled) return;
  if (!auth) initFirebase();
  await signOut(auth);
}
