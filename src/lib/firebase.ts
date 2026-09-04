import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Support Vercel / Vite environment variables with production defaults
const env = (import.meta as unknown as { env?: Record<string, string> })?.env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDh8sNuxAeTWGgJTLBwwNmc5pJF-ERVsOk",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "urbanpulse-2026.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "urbanpulse-2026",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "urbanpulse-2026.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "235538520233",
  appId: env.VITE_FIREBASE_APP_ID || env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:235538520233:web:c934aecdaabc30f215b1b8",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FBSDMSC80Z"
};

// Log active Firebase config (never expose API keys or secrets)
console.log("🔥 FIREBASE ACTIVE CONFIG:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId
});

// Single singleton Firebase instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("🔥 FIRESTORE INITIALIZED:", db.app.options.projectId);

// Temporary Firestore connection test
(async () => {
  try {
    const testDocRef = doc(db, "connectionTest", "testDoc");
    await setDoc(testDocRef, {
      testMessage: "Firestore connection test",
      timestamp: serverTimestamp()
    });
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log("🔥 FIREBASE CONNECTION SUCCESS", docSnap.data());
    } else {
      console.log("🔥 FIREBASE CONNECTION SUCCESS");
    }
  } catch (error) {
    console.error("🔥 FIREBASE CONNECTION FAILED:", error);
  }
})();

export default app;
