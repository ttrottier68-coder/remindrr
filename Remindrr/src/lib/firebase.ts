// Firebase configuration and helpers
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDsGwszAa34dXq-DtqZ-GPWEK3RUdoT9zI",
  authDomain: "remindrr-d892c.firebaseapp.com",
  projectId: "remindrr-d892c",
  storageBucket: "remindrr-d892c.firebasestorage.app",
  messagingSenderId: "1033906172145",
  appId: "1:1033906172145:web:9f91ce8d991fb40d25b950",
  measurementId: "G-FXVB8YF168"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth helpers
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };

// Firestore helpers
export { doc, setDoc, getDoc, collection, query, where, getDocs };