import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "firebase/auth";
import { getDatabase, ref, push, set, onValue } from "firebase/database";

// ✅ Ensure Firebase is initialized properly
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// ✅ Initialize Firebase (check if an app exists first)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ✅ Initialize services safely
let analytics, auth, database;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
  auth = getAuth(app);
  database = getDatabase(app);
}

// ✅ Export everything
export {
  app,
  analytics,
  auth,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  database,
  getDatabase,
  ref,
  push,
  set,
  onValue
};
