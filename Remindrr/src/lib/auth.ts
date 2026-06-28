// ─── Auth utilities with Firebase ───────────────────────────────────────────────────

import { isFirebaseReady, waitForFirebase, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc } from './firebase';
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
  // NOTE: Do NOT clear remindrr_settings, remindrr_clients, remindrr_invoices
  // — settings (Stripe, PayPal, Venmo, Zelle, SendGrid, etc.) persist across logout
  // Only the auth session is cleared.
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

/** Register new user - using Firebase Auth, falls back to local-only */
export async function register(email: string, password: string, name: string, businessName?: string): Promise<string | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Try Firebase if ready
    const ready = await waitForFirebase();
    if (!ready) {
      // Fall back to local-only registration
      const now = new Date();
      const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
      saveSession({
        email: normalizedEmail,
        name: name,
        loggedInAt: now.toISOString(),
        sessionExpiry: expiry.toISOString(),
      });
      localStorage.setItem('remindrr_login', normalizedEmail);
      return null;
    }

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(normalizedEmail, password);
    const firebaseUid = userCredential.user.uid;

    // Save user profile to Firestore
    await setDoc(doc('users', firebaseUid), {
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
    
    // Also save to localStorage for fallback login
    localStorage.setItem('remindrr_login', normalizedEmail);

    return null; // success
  } catch (error: any) {
    // Registration error — Firebase auth failed
    if (error.code === 'auth/email-already-in-use') {
      return 'An account with this email already exists.';
    }
    return 'Registration failed. Please try again.';
  }
}

/** Login - uses Firebase for cloud auth */
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

    // Wait for Firebase to load
    const ready = await waitForFirebase();
    if (!ready) {
      // Try local fallback if Firebase hasn't loaded yet
      const savedEmail = localStorage.getItem('remindrr_login');
      if (savedEmail === normalizedEmail) {
        const localSettings = getSettings();
        const now = new Date();
        const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
        saveSession({
          email: normalizedEmail,
          name: localSettings?.ownerName || normalizedEmail.split('@')[0],
          loggedInAt: now.toISOString(),
          sessionExpiry: expiry.toISOString(),
        });
        // Restore ALL local settings
        if (localSettings) saveSettingsLocal(localSettings);
        return null;
      }
      return 'Please wait a moment for the page to load, then try again.';
    }

    // Firebase login
    const userCredential = await signInWithEmailAndPassword(normalizedEmail, password);
    const firebaseUid = userCredential.user.uid;

    // Preserve ALL existing settings before saving new session
    const existingSettings = getSettings();
    
    // Save session with Firebase UID
    const now = new Date();
    const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    saveSession({
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      loggedInAt: now.toISOString(),
      sessionExpiry: expiry.toISOString(),
      firebaseUid: firebaseUid,
    });
    
    // Restore ALL settings after login (Stripe, PayPal, Venmo, Zelle, SendGrid, etc.)
    if (existingSettings) {
      saveSettingsLocal(existingSettings);
    }
    
    localStorage.setItem('remindrr_login', normalizedEmail);

    return null;
  } catch (error: any) {
    // Login error — Firebase auth failed
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      return 'Incorrect password. Please try again.';
    }
    if (error.code === 'auth/user-not-found') {
      return 'No account found with this email. Please sign up.';
    }
    if (error.code === 'auth/too-many-requests') {
      return 'Too many login attempts. Please wait and try again.';
    }
    // DEBUG — remove after diagnosis
    console.error('Login error details:', error.code, error.message, JSON.stringify(error));
    return 'Login failed. Please try again.';
  }
}

/** Logout - clears session and signs out of Firebase, but keeps settings */
export async function logout(): Promise<void> {
  // Logout — clear Firebase session and local data
  waitForFirebase().then(async (ready) => {
    if (ready) {
      try { await signOut(); } catch { /* ignore signOut errors */ }
    }
  }).catch(() => {});
  clearLocalSession();
  // NOTE: Do NOT delete settings - we want to preserve SendGrid API key
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