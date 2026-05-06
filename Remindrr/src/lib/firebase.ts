// Firebase configuration and helpers - using CDN-loaded Firebase
// The Firebase SDKs are loaded in index.html via global script tags

// Type declarations for Firebase globals
declare global {
  interface Window {
    firebase: any;
    firebase.auth: any;
    firebase.firestore: any;
  }
}

// Get Firebase instances from global CDN objects
function getFirebaseApp() {
  return window.firebase?.initializeApp ? window.firebase : null;
}

function getFirebaseAuth() {
  if (!window.firebase?.auth) return null;
  try {
    return window.firebase.auth();
  } catch {
    return null;
  }
}

function getFirebaseFirestore() {
  if (!window.firebase?.firestore) return null;
  try {
    return window.firebase.firestore();
  } catch {
    return null;
  }
}

// Initialize Firebase - called after SDKs load
export const app = null; // Will be initialized lazily
export const auth = null;
export const db = null;

// Helper to check if Firebase is ready
export function isFirebaseReady(): boolean {
  return !!window.firebase && !!window.firebase.auth && !!window.firebase.firestore;
}

// Auth helpers (lazy-loaded)
export async function createUserWithEmailAndPassword(email: string, password: string) {
  if (!window.firebase?.auth) throw new Error('Firebase not loaded');
  return window.firebase.auth().createUserWithEmailAndPassword(email, password);
}

export async function signInWithEmailAndPassword(email: string, password: string) {
  if (!window.firebase?.auth) throw new Error('Firebase not loaded');
  return window.firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
  if (!window.firebase?.auth) return;
  return window.firebase.auth().signOut();
}

export function onAuthStateChanged(callback: (user: any) => void) {
  if (!window.firebase?.auth) return;
  return window.firebase.auth().onAuthStateChanged(callback);
}

// Firestore helpers (lazy-loaded)
export function doc(...path: string[]) {
  if (!window.firebase?.firestore) throw new Error('Firebase not loaded');
  return window.firebase.firestore().doc(path.join('/'));
}

export async function setDoc(docRef: any, data: any) {
  if (!window.firebase?.firestore) throw new Error('Firebase not loaded');
  return docRef.set(data);
}

export async function getDoc(docRef: any) {
  if (!window.firebase?.firestore) throw new Error('Firebase not loaded');
  return docRef.get();
}