import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId || undefined
};

// Initialize Firebase App safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Safe, non-blocking Analytics initialization (dynamically imported so iframe storage sandbox doesn't block app boot)
export let analytics: any = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  // Run asynchronously without blocking app rendering
  setTimeout(() => {
    import('firebase/analytics')
      .then(({ getAnalytics, isSupported }) => {
        return isSupported().then((supported) => {
          if (supported) {
            analytics = getAnalytics(app);
          }
        });
      })
      .catch((err) => {
        console.debug('Firebase Analytics skipped or not supported in current environment:', err);
      });
  }, 1000);
}

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const databaseId = firebaseConfigJson.firestoreDatabaseId;
export const db = (databaseId && databaseId !== '(default)')
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
