// Firebase wrapper - loads dynamically at runtime from CDN
// This file is designed to work with CDN-loaded Firebase

export const firebaseConfig = {
  apiKey: "AIzaSyDsGwszAa34dXq-DtqZ-GPWEK3RUdoT9zI",
  authDomain: "remindrr-d892c.firebaseapp.com",
  projectId: "remindrr-d892c",
  storageBucket: "remindrr-d892c.firebasestorage.app",
  messagingSenderId: "1033906172145",
  appId: "1:1033906172145:web:9f91ce8d991fb40d25b950"
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
  // This is the correct way - no auth object needed
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