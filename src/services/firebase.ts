import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

// Expected canonical project ID from config
export const EXPECTED_PROJECT_ID = rawConfig.projectId || 'gen-lang-client-0609404476';

// Support Vercel / CI / Custom environment variables with fallback to config
const env = ((import.meta as unknown) as { env?: Record<string, string> })?.env || {};

const activeConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || rawConfig.appId,
  firestoreDatabaseId: env.VITE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId || '(default)'
};

// Detect Deployment Environment (Production vs Vercel Preview vs Local Dev)
export function getDeploymentEnvironment(): 'production' | 'preview' | 'development' {
  try {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    // Vercel Preview deployments typically have '-git-' or preview in URL
    if (hostname.includes('-git-') || hostname.includes('preview') || hostname.includes('vercel.app') && hostname.split('.').length > 3) {
      return 'preview';
    }
    return 'production';
  } catch {
    return 'production';
  }
}

// Project ID Safety Check
export function getProjectSafetyCheck() {
  const currentId = activeConfig.projectId;
  const isMatch = !EXPECTED_PROJECT_ID || currentId === EXPECTED_PROJECT_ID;
  const env = getDeploymentEnvironment();
  return {
    currentProjectId: currentId,
    expectedProjectId: EXPECTED_PROJECT_ID,
    isMatch,
    environment: env,
    databaseId: activeConfig.firestoreDatabaseId
  };
}

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

// Reduce noisy reconnect logging in browser console
setLogLevel('error');

let db: Firestore;
try {
  db = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true
    },
    activeConfig.firestoreDatabaseId || '(default)'
  );
} catch {
  db = activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, activeConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export { db, app, activeConfig };


