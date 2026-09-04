import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDh8sNuxAeTWGgJTLBwwNmc5pJF-ERVsOk",
  authDomain: "urbanpulse-2026.firebaseapp.com",
  projectId: "urbanpulse-2026",
  storageBucket: "urbanpulse-2026.firebasestorage.app",
  messagingSenderId: "235538520233",
  appId: "1:235538520233:web:c934aecdaabc30f215b1b8",
  measurementId: "G-FBSDMSC80Z"
};

// Initialize Firebase without breaking SSR or localhost development
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
