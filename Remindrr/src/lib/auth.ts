// ─── Auth utilities ───────────────────────────────────────────────────────────

const AUTH_KEY = 'remindrr_auth';
const PASSWORDS_KEY = 'remindrr_passwords';
const SESSION_DAYS = 30;

export interface AuthSession {
  email: string;
  name: string;
  loggedInAt: string;
  sessionExpiry: string;
}

export interface PasswordStore {
  [email: string]: string; // email → SHA-256 hash
}

// ─── Password hashing ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

// ─── Password store helpers ───────────────────────────────────────────────────

function getPasswords(): PasswordStore {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePassword(email: string, hash: string): void {
  const store = getPasswords();
  store[email] = hash;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(store));
}

// ─── Session helpers ──────────────────────────────────────────────────────────

function getSession(): AuthSession | null {
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

function clearSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

// Demo credentials (exported for use in LoginPage/SignupPage)
export const DEMO_EMAIL = 'demo@remindrr.app';
export const DEMO_PASSWORD = 'demo1234';
// Pre-computed SHA-256 hash of 'demo1234' so this runs sync with no async needed
const DEMO_HASH = 'jGlngIHI7VXwjn+WTt8Es+DiHV6VE9/zYpFPgI/sqHs=';

/** Auto-register the demo account if not exists — synchronous, no async needed */
export function ensureDemoAccount(): void {
  const passwords = getPasswords();
  if (!passwords[DEMO_EMAIL]) {
    savePassword(DEMO_EMAIL, DEMO_HASH);
  }
}

/** Auto-login as demo user */
export async function loginAsDemo(): Promise<string | null> {
  ensureDemoAccount();
  return login(DEMO_EMAIL, DEMO_PASSWORD);
}

/** Check if a user is currently logged in with a valid session */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/** Get current logged-in session (or null) */
export function getCurrentSession(): AuthSession | null {
  return getSession();
}

/** Register a new account. Returns error string or null on success. */
export async function register(
  email: string,
  password: string,
  name: string,
  businessName: string
): Promise<string | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const passwords = getPasswords();

  if (passwords[normalizedEmail]) {
    return 'An account with this email already exists.';
  }

  const hash = await hashPassword(password);
  savePassword(normalizedEmail, hash);

  const now = new Date();
  const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  saveSession({
    email: normalizedEmail,
    name: name.trim(),
    loggedInAt: now.toISOString(),
    sessionExpiry: expiry.toISOString(),
  });

  // Extra safety: also store a pending flag so App knows to let us through
  try { sessionStorage.setItem('remindrr_just_registered', '1'); } catch {}

  return null;
}

/** Log in with email + password. Returns error string or null on success. */
export async function login(email: string, password: string): Promise<string | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // ── Hardcoded demo account (works on any URL, no localStorage needed) ──────
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

  // ── Regular accounts ────────────────────────────────────────────────────────
  const passwords = getPasswords();
  const storedHash = passwords[normalizedEmail];

  if (!storedHash) {
    return 'No account found with this email.';
  }

  const inputHash = await hashPassword(password);
  if (inputHash !== storedHash) {
    return 'Incorrect password. Please try again.';
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  saveSession({
    email: normalizedEmail,
    name: '', // name loaded from settings if available
    loggedInAt: now.toISOString(),
    sessionExpiry: expiry.toISOString(),
  });

  return null;
}

/** Log the current user out */
export function logout(): void {
  clearSession();
}

/** Update the session name (e.g., after loading from settings) */
export function updateSessionName(name: string): void {
  const session = getSession();
  if (session) {
    session.name = name;
    saveSession(session);
  }
}

/** Check if an email has an existing account */
export function emailExists(email: string): boolean {
  const passwords = getPasswords();
  return !!passwords[email.toLowerCase().trim()];
}

/** Clear a user's password so they can reset it (enables "forgot password" flow) */
export function clearPassword(email: string): void {
  const passwords = getPasswords();
  delete passwords[email.toLowerCase().trim()];
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
}
