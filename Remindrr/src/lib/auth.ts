// ─── Auth utilities with Firebase ───────────────────────────────────────────────────

import { app, auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc } from './firebase';
import type { User } from 'firebase/auth';
import { getSettings, saveSettings as saveSettingsLocal, deleteSettings } from './reminder-data';

const AUTH_KEY = 'remindrr_session';
const SESSION_DAYS = 30;

export interface AuthSession {
  email: string;
  name: string;
  loggedInAt: string;
  sessionExpiry: string;
  firebaseUid?: string;
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Check expiry
    if (new Date(session.sessionExpiry) < new Date()) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

function clearLocalSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

// ─── Auth functions ────────────────────────────────────────────────────────────────

// Demo credentials
export const DEMO_EMAIL = 'demo@remindrr.app';
export const DEMO_PASSWORD = 'demo1234';

/** Check if user is authenticated */
export function isAuthenticated(): boolean {
  return !!getSession();
}

/** Get current user email */
export function getUserEmail(): string | null {
  const session = getSession();
  return session?.email || null;
}

/** Get current user name */
export function getUserName(): string | null {
  const session = getSession();
  return session?.name || null;
}

/** Register new user - using Firebase Auth */
export async function register(email: string, password: string, name: string, businessName?: string): Promise<string | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(normalizedEmail, password);
    const firebaseUid = userCredential.user.uid;

    // Save user profile to Firestore (includes name and default settings)
    await setDoc(doc(db, 'users', firebaseUid), {
      email: normalizedEmail,
      name: name,
      businessName: businessName || '',
      createdAt: new Date().toISOString(),
    });

    // Save local session
    const now = new Date();
    const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    saveSession({
      email: normalizedEmail,
      name: name,
      loggedInAt: now.toISOString(),
      sessionExpiry: expiry.toISOString(),
      firebaseUid: firebaseUid,
    });

    return null; // success
  } catch (error: any) {
    console.error('register error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return 'An account with this email already exists.';
    }
    return 'Registration failed. Please try again.';
  }
}

/** Login - tries Firebase first, falls back to localStorage */
export async function login(email: string, password: string): Promise<string | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Demo account login
    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const now = new Date();
      const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
      saveSession({
        email: DEMO_EMAIL,
        name: 'Demo User',
        loggedInAt: now.toISOString(),
        sessionExpiry: expiry.toISOString(),
      });
      return null;
    }

    // Try Firebase login
    const userCredential = await signInWithEmailAndPassword(normalizedEmail, password);
    const firebaseUid = userCredential.user.uid;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUid));
    const userData = userDoc.exists() ? userDoc.data() : { name: email.split('@')[0] };

    // Save local session
    const now = new Date();
    const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    saveSession({
      email: normalizedEmail,
      name: userData?.name || normalizedEmail.split('@')[0],
      loggedInAt: now.toISOString(),
      sessionExpiry: expiry.toISOString(),
      firebaseUid: firebaseUid,
    });

    return null; // success
  } catch (error: any) {
    console.error('login error:', error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      return 'Incorrect password. Please try again.';
    }
    if (error.code === 'auth/user-not-found') {
      return 'No account found with this email.';
    }
    return 'Login failed. Please try again.';
  }
}

/** Logout - clears local session and Firebase auth */
export async function logout(): Promise<void> {
  try {
    await signOut();
  } catch (e) {
    console.log('Firebase signOut error:', e);
  }
  clearLocalSession();
  deleteSettings();
}

/** Check if email exists (placeholder - Firebase doesn't allow checking without action) */
export async function emailExists(email: string): Promise<boolean> {
  // Firebase doesn't provide a direct "check if email exists" API
  // For now, always return false - user will get error on actual login attempt
  return false;
}

/** Clear password reset data */
export function clearPassword(): void {
  // No-op placeholder
}

/** Ensure demo account exists */
export async function ensureDemoAccount(): Promise<void> {
  // Demo account is already handled in login() - no-op
}

/** Auto-login as demo user */
export async function loginAsDemo(): Promise<string | null> {
  return login(DEMO_EMAIL, DEMO_PASSWORD);
}

/** Listen for auth changes (for future use with onAuthStateChanged) */
export function initAuthListener(callback: (user: User | null) => void): void {
  onAuthStateChanged(auth, callback);
}