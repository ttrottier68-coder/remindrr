// Firebase configuration - loads from environment variables
// These should be set in Netlify dashboard as environment variables:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, etc.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase is ready (loaded in index.html)
export function isFirebaseReady(): boolean {
  return typeof window !== 'undefined' && !!(window as any).firebase?.auth;
}

// Lazy-load Firebase auth functions
export async function createUserWithEmailAndPassword(email: string, password: string) {
  if (!isFirebaseReady()) throw new Error('Firebase not loaded');
  return (window as any).firebase.auth().createUserWithEmailAndPassword(email, password);
}

export async function signInWithEmailAndPassword(email: string, password: string) {
  if (!isFirebaseReady()) throw new Error('Firebase not loaded');
  return (window as any).firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
  if (!isFirebaseReady()) return;
  return (window as any).firebase.auth().signOut();
}

export function onAuthStateChanged(callback: (user: any) => void) {
  if (!isFirebaseReady()) return;
  return (window as any).firebase.auth().onAuthStateChanged(callback);
}

// Firestore functions
export function doc(...pathParts: string[]) {
  if (!isFirebaseReady()) throw new Error('Firebase not loaded');
  const path = pathParts.join('/');
  return (window as any).firebase.firestore().doc(path);
}

export async function setDoc(docRef: any, data: any) {
  if (!isFirebaseReady()) throw new Error('Firebase not loaded');
  return docRef.set(data);
}

export async function getDoc(docRef: any) {
  if (!isFirebaseReady()) throw new Error('Firebase not loaded');
  return docRef.get();
}

// Re-export for compatibility
export const app = null;
export const auth = null;
export const db = null;