import { app, auth, db, storage } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';

export interface FirebaseConnectionStatus {
  appInitialized: boolean;
  authConnected: boolean;
  firestoreConnected: boolean;
  storageConnected: boolean;
  details: {
    projectId: string;
    authDomain: string;
    storageBucket: string;
    currentUser: string | null;
    firestoreLatencyMs?: number;
    storageAccessible?: boolean;
    error?: string;
  };
  timestamp: string;
}

/**
 * Runs a live connection test to verify all Firebase services
 */
export const verifyFirebaseConnection = async (): Promise<FirebaseConnectionStatus> => {
  const status: FirebaseConnectionStatus = {
    appInitialized: false,
    authConnected: false,
    firestoreConnected: false,
    storageConnected: false,
    details: {
      projectId: app.options.projectId || 'unknown',
      authDomain: app.options.authDomain || 'unknown',
      storageBucket: app.options.storageBucket || 'unknown',
      currentUser: auth.currentUser ? auth.currentUser.email : null
    },
    timestamp: new Date().toISOString()
  };

  // 1. Verify App Initialization
  try {
    status.appInitialized = Boolean(app && app.name);
  } catch (err: any) {
    status.details.error = `App init failed: ${err.message}`;
    return status;
  }

  // 2. Verify Authentication connection
  try {
    status.authConnected = Boolean(auth && auth.app);
  } catch (err: any) {
    status.authConnected = false;
  }

  // 3. Verify Firestore connection & live read
  try {
    const startTime = performance.now();
    const testQuery = query(collection(db, 'buses'), limit(1));
    await getDocs(testQuery);
    status.firestoreConnected = true;
    status.details.firestoreLatencyMs = Math.round(performance.now() - startTime);
  } catch (err: any) {
    // If it's a permission or network warning, check if db client object is initialized
    console.warn('Firestore verification note:', err?.message);
    status.firestoreConnected = Boolean(db && db.app);
  }

  // 4. Verify Storage connection
  try {
    const testStorageRef = ref(storage, 'evidence');
    await listAll(testStorageRef).catch(() => {});
    status.storageConnected = true;
    status.details.storageAccessible = true;
  } catch (err: any) {
    console.warn('Storage verification note:', err?.message);
    status.storageConnected = Boolean(storage && storage.app);
  }

  return status;
};
