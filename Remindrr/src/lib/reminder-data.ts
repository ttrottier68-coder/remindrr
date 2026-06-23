import type { Invoice, Client, UserSettings } from '../types';

export type { UserSettings };

const SETTINGS_KEY = 'remindrr_settings';
const INVOICES_KEY = 'remindrr_invoices';
const CLIENTS_KEY  = 'remindrr_clients';
const SENDGRID_KEY = 'remindrr_sendgrid'; // Separate key for SendGrid - persists on logout
const GMAIL_KEY    = 'remindrr_gmail';    // Separate key for Gmail OAuth tokens

function safe<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function persist(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getSettings(): UserSettings {
  // Load main settings
  const mainSettings = safe(SETTINGS_KEY, {
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    plan: 'starter',
    sendgridApiKey: '',
    sendgridFromEmail: '',
  });
  
  // Load SendGrid/Resend from separate key (persists on logout)
  const sendgridStored = safe(SENDGRID_KEY, { apiKey: '', fromEmail: '' });

  // Merge: use SendGrid/Resend from separate key if available
  return {
    ...mainSettings,
    sendgridApiKey: sendgridStored.apiKey || mainSettings.sendgridApiKey,
    sendgridFromEmail: sendgridStored.fromEmail || mainSettings.sendgridFromEmail,
  };
}

// ─── Gmail OAuth ────────────────────────────────────────────────────────────

export interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email?: string;
}

export function getGmailTokens(): GmailTokens | null {
  return safe(GMAIL_KEY, null);
}

export function saveGmailTokens(tokens: GmailTokens) {
  persist(GMAIL_KEY, tokens);
}

export function clearGmailTokens() {
  localStorage.removeItem(GMAIL_KEY);
}

const CLIENT_ID = '1033906172145-gn4egevo8hlgue5cfm06sal4gvr69lq1.apps.googleusercontent.com';
const REDIRECT_URI = 'https://remindrr.app/.netlify/functions/gmail-oauth';
const SCOPE = encodeURIComponent('https://www.googleapis.com/auth/gmail.send');

export async function getGmailAuthUrl(): Promise<string> {
  const state = Math.random().toString(36).substring(2);
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}&access_type=offline&prompt=consent&state=${state}`;
}

export async function exchangeGmailCode(code: string): Promise<GmailTokens> {
  const res = await fetch('/.netlify/functions/gmail-oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Token exchange failed');
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    email: data.email,
  };
}

export async function refreshGmailToken(tokens: GmailTokens): Promise<string> {
  const res = await fetch('/.netlify/functions/gmail-oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: '/refresh', refreshToken: tokens.refreshToken }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Token refresh failed');
  return data.accessToken;
}

async function getValidGmailToken(): Promise<{ token: string; gmail: GmailTokens } | null> {
  const gmail = getGmailTokens();
  if (!gmail?.accessToken) return null;
  // Refresh if expires in < 5 minutes
  if (Date.now() + 300000 < gmail.expiresAt) return { token: gmail.accessToken, gmail };
  try {
    const newToken = await refreshGmailToken(gmail);
    const updated = { ...gmail, accessToken: newToken, expiresAt: Date.now() + 3600000 };
    saveGmailTokens(updated);
    return { token: newToken, gmail: updated };
  } catch {
    return null;
  }
}

async function sendViaGmail(toEmail: string, subject: string, html: string, text: string): Promise<{ success: boolean; message: string }> {
  const valid = await getValidGmailToken();
  if (!valid) {
    return { success: false, message: 'Gmail not connected. Please reconnect in Settings.' };
  }
  const gmail = valid.gmail;
  const res = await fetch('/.netlify/functions/send-gmail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: valid.token,
      toEmail,
      fromEmail: gmail.email || 'me',
      subject,
      text,
      html,
    }),
  });
  const data = await res.json();
  if (res.status === 401) {
    clearGmailTokens();
    return { success: false, message: 'Gmail token expired — please reconnect in Settings.' };
  }
  if (!data.success) return { success: false, message: data.message };
  return { success: true, message: 'Email sent via Gmail!' };
}

export function saveSettings(s: Partial<UserSettings>): UserSettings {
  const prev = getSettings();
  const next = { ...prev, ...s };
  persist(SETTINGS_KEY, next);
  
  // Also save SendGrid to separate key (persists on logout)
  if (s.sendgridApiKey || s.sendgridFromEmail) {
    persist(SENDGRID_KEY, {
      apiKey: s.sendgridApiKey || prev.sendgridApiKey,
      fromEmail: s.sendgridFromEmail || prev.sendgridFromEmail,
    });
  }
  
  return next;
}

export function getInvoices(): Invoice[] {
  return safe(INVOICES_KEY, []);
}

export function saveInvoice(inv: Invoice) {
  const all = getInvoices().filter(i => i.id !== inv.id);
  const updated = [...all, inv];
  persist(INVOICES_KEY, updated);
  // Sync to cloud for persistence across deploys
  syncToCloud(getSettings(), updated, getClients());
}

export function markInvoicePaid(id: string) {
  const all = getInvoices().map(i => i.id === id ? { ...i, status: 'paid' as const, paidAt: new Date().toISOString() } : i);
  persist(INVOICES_KEY, all);
  syncToCloud(getSettings(), all, getClients());
}

export function deleteInvoice(id: string) {
  const all = getInvoices().filter(i => i.id !== id);
  persist(INVOICES_KEY, all);
  syncToCloud(getSettings(), all, getClients());
}

export function openMailto(invoice: Invoice): void {
  const settings = getSettings();
  const client = getClients().find(c => c.id === invoice.clientId);
  const clientEmail = client?.email || invoice.clientEmail;
  const clientName = client?.name || invoice.clientName;
  
  const subject = encodeURIComponent(`Invoice for ${invoice.description} - $${invoice.amount}`);
  const dueDate = new Date(invoice.dueDate).toLocaleDateString();
  
  // Build payment methods section
  let paymentMethods = '';
  if (settings.paypalMe) paymentMethods += `\nPayPal: ${settings.paypalMe}`;
  if (settings.venmoUsername) paymentMethods += `\nVenmo: ${settings.venmoUsername}`;
  if (settings.zelleInfo) paymentMethods += `\nZelle: ${settings.zelleInfo}`;
  
  const invoicePaymentLink = invoice.paymentLink || '';
  const body = encodeURIComponent(`Hi ${clientName},

This is a friendly reminder about your invoice:

Description: ${invoice.description}
Amount: $${invoice.amount}
Due Date: ${dueDate}${invoicePaymentLink ? `\nPay Online: ${invoicePaymentLink}` : ''}${paymentMethods}

Please send payment at your earliest convenience.

Thank you!
${settings?.businessName || ''}`);
  
  // Open Gmail compose window directly (works in all browsers)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${subject}&body=${body}`;
  window.open(gmailUrl, '_blank');
}

export async function sendReminderNow(invoice: Invoice): Promise<{ success: boolean; message: string }> {
  const settings = getSettings();
  const client = getClients().find(c => c.id === invoice.clientId);
  const clientEmail = client?.email || invoice.clientEmail;
  const subject = `Payment Reminder: Invoice #${invoice.id.slice(0, 8)} for $${invoice.amount}`;
  const html = buildEmailHtml(invoice, client, settings.businessName, settings);
  const text = `Payment Reminder for Invoice #${invoice.id.slice(0, 8)}\n\nAmount: $${invoice.amount}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nPlease send payment at your earliest convenience.\n\nThank you,\n${settings.businessName || ''}`;

  // ── 1. Try Gmail first ─────────────────────────────────────────────────────
  const gmailResult = await sendViaGmail(clientEmail, subject, html, text);
  if (gmailResult.success) {
    const invoices = getInvoices();
    const updated = invoices.map(i => i.id === invoice.id ? {
      ...i, reminderSent: true, lastReminderSentAt: new Date().toISOString(),
      followupCount: (i.followupCount || 0) + 1,
    } : i);
    persist(INVOICES_KEY, updated);
    syncToCloud(getSettings(), updated, getClients());
    return { success: true, message: 'Reminder sent!' };
  }

  // ── 2. Fall back to SendGrid / Resend ─────────────────────────────────────
  if (!settings.sendgridApiKey || !settings.sendgridFromEmail) {
    return { success: false, message: 'Email not configured. Go to Settings → Email Reminders to connect Gmail or add your API key.' };
  }

  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: settings.sendgridApiKey,
        fromEmail: settings.sendgridFromEmail,
        toEmail: clientEmail,
        subject,
        html,
      }),
    });

    if (response.ok) {
      const invoices = getInvoices();
      const updated = invoices.map(i => i.id === invoice.id ? {
        ...i, reminderSent: true, lastReminderSentAt: new Date().toISOString(),
        followupCount: (i.followupCount || 0) + 1,
      } : i);
      persist(INVOICES_KEY, updated);
      syncToCloud(getSettings(), updated, getClients());
      return { success: true, message: 'Reminder sent!' };
    } else {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data.message || 'Failed to send reminder.' };
    }
  } catch {
    return { success: false, message: 'Could not connect. Check your email settings.' };
  }
}

function buildEmailHtml(invoice: Invoice, client: Client | undefined, businessName: string, settings: UserSettings) {
  const due = new Date(invoice.dueDate).toLocaleDateString();
  const amount = invoice.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const payLink = invoice.paymentLink || '';
  const business = businessName || 'Invoice Reminder';
  const clientName = client?.name || 'there';
  const description = invoice.description || 'your invoice';

  // Build payment method buttons/links
  const paypalSection = settings.paypalMe ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#0070ba;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">PayPal</div>
      <a href="${settings.paypalMe}" style="color:#0070ba;font-weight:600;font-size:14px;text-decoration:none;">${settings.paypalMe} →</a>
    </div>` : '';

  const venmoSection = settings.venmoUsername ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#3d95ce;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">Venmo</div>
      <span style="color:#1e293b;font-size:14px;"><strong>${settings.venmoUsername}</strong> <span style="color:#64748b;font-size:12px;">— scan in the Venmo app</span></span>
    </div>` : '';

  const zelleSection = settings.zelleInfo ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#6d1a8a;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">Zelle</div>
      <span style="color:#1e293b;font-size:14px;">Send to: <strong>${settings.zelleInfo}</strong></span>
    </div>` : '';

  const paymentMethodsSection = (paypalSection || venmoSection || zelleSection) ? `
    <div style="margin:0 0 24px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1e293b;">💳 Or pay with:</p>
      ${paypalSection}${venmoSection}${zelleSection}
    </div>` : '';

  const payOnlineSection = payLink ? `
    <a href="${payLink}" style="display:block;text-align:center;background:#6366f1;color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin:0 0 24px;">Pay Online (Credit/Debit) →</a>` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#1e293b;">
  <div style="background:#6366f1;padding:32px 24px;text-align:center;border-radius:16px 16px 0 0;">
    <h1 style="margin:0;color:#fff;font-size:24px;">${business}</h1>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:32px 24px 40px;border-radius:0 0 16px 16px;">
    <p style="margin:0 0 16px;font-size:16px;">Hi ${clientName},</p>
    <p style="margin:0 0 24px;font-size:16px;">This is a friendly reminder that your invoice is due.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Amount Due</p>
      <p style="margin:0;font-size:36px;font-weight:bold;color:#6366f1;">${amount}</p>
      <p style="margin:8px 0 0;font-size:14px;color:#64748b;">Due: ${due}</p>
    </div>
    <p style="margin:0 0 20px;font-size:16px;">${description}</p>
    ${payOnlineSection}
    ${paymentMethodsSection}
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">Powered by Remindrr</p>
  </div>
</body></html>`;
}

export function getClients(): Client[] {
  return safe(CLIENTS_KEY, []);
}

export function saveClient(c: Client) {
  const all = getClients().filter(x => x.id !== c.id);
  persist(CLIENTS_KEY, [...all, c]);
}

export function deleteSettings() {
  // Preserve Resend settings on logout so users don't have to re-enter them
  const settings = getSettings();
  const sendgridApiKey = settings.sendgridApiKey;
  const sendgridFromEmail = settings.sendgridFromEmail;
  
  localStorage.removeItem(SETTINGS_KEY);
  
  // Restore Resend settings after clearing
  if (sendgridApiKey || sendgridFromEmail) {
    persist(SETTINGS_KEY, { sendgridApiKey, sendgridFromEmail });
  }
}

export interface Stats {
  totalOutstanding: number;
  dueSoon: number;
  overdue: number;
  paidThisMonth: number;
}

export function getDashboardStats(): Stats {
  const all = getInvoices();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return {
    totalOutstanding: all.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0),
    dueSoon: all.filter(i => i.status !== 'paid' && daysUntil(i.dueDate) <= 3 && daysUntil(i.dueDate) >= 0).length,
    overdue: all.filter(i => i.status !== 'paid' && daysUntil(i.dueDate) < 0).length,
    paidThisMonth: all.filter(i => i.status === 'paid' && i.paidAt && i.paidAt >= startOfMonth).reduce((s, i) => s + i.amount, 0),
  };
}

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

// ─── Firestore sync (new) ───────────────────────────────────────────────────

import { isFirebaseReady, doc, setDoc, getDoc } from './firebase';
import { getSession } from './auth';

const FIRESTORE_ENABLED = true;

/** Save all user data to Firestore */
export async function syncToCloud(settings: UserSettings, invoices: Invoice[], clients: Client[]): Promise<void> {
  if (!FIRESTORE_ENABLED) return;
  const session = getSession();
  const firebaseUid = session?.firebaseUid;
  if (!firebaseUid) return;
  
  try {
    const settingsRef = doc('users', firebaseUid, 'data', 'settings');
    const invoicesRef = doc('users', firebaseUid, 'data', 'invoices');
    const clientsRef = doc('users', firebaseUid, 'data', 'clients');
    await setDoc(settingsRef, settings);
    await setDoc(invoicesRef, { list: invoices });
    await setDoc(clientsRef, { list: clients });
    // Synced to Firestore
  } catch {
    // Silently fail cloud sync — local data still works
  }
}

/** Load user data from Firestore */
export async function loadFromCloud(): Promise<{ settings: UserSettings | null; invoices: Invoice[] | null; clients: Client[] | null }> {
  if (!FIRESTORE_ENABLED) return { settings: null, invoices: null, clients: null };
  const session = getSession();
  const firebaseUid = session?.firebaseUid;
  if (!firebaseUid) return { settings: null, invoices: null, clients: null };
  
  try {
    const settingsRef = doc('users', firebaseUid, 'data', 'settings');
    const invoicesRef = doc('users', firebaseUid, 'data', 'invoices');
    const clientsRef = doc('users', firebaseUid, 'data', 'clients');
    const settingsDoc = await getDoc(settingsRef);
    const invoicesDoc = await getDoc(invoicesRef);
    const clientsDoc = await getDoc(clientsRef);
    
    return {
      settings: settingsDoc.exists() ? settingsDoc.data() as UserSettings : null,
      invoices: invoicesDoc.exists() ? (invoicesDoc.data().list as Invoice[]) : null,
      clients: clientsDoc.exists() ? (clientsDoc.data().list as Client[]) : null,
    };
  } catch (e) {
    // Load from Firestore failed — fall back to local data
    return { settings: null, invoices: null, clients: null };
  }
}

// ─── Auto-Reminder Scheduler ─────────────────────────────────────────────────
// Runs on app load. Sends automatic reminders for overdue or due-soon invoices.
// Call checkAndFireAutoReminders() in App.tsx on mount.

const LAST_AUTO_CHECK_KEY = 'remindrr_last_auto_check';

export async function checkAndFireAutoReminders(): Promise<void> {
  const settings = getSettings();
  if (!settings?.sendgridApiKey || !settings?.sendgridFromEmail) return;
  
  // Only run once per 24 hours
  const lastCheck = localStorage.getItem(LAST_AUTO_CHECK_KEY);
  if (lastCheck) {
    const hoursSince = (Date.now() - parseInt(lastCheck)) / (1000 * 60 * 60);
    if (hoursSince < 24) return;
  }
  localStorage.setItem(LAST_AUTO_CHECK_KEY, String(Date.now()));

  const invoices = getInvoices().filter(i => i.status !== 'paid');
  const now = new Date();
  const reminderCandidates: Invoice[] = [];

  for (const inv of invoices) {
    const due = new Date(inv.dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / 86400000);
    
    // Send if overdue or due within 1 day
    if (daysUntilDue <= 1) {
      // Only send if not already sent today
      if (!inv.lastReminderSentAt) {
        reminderCandidates.push(inv);
      } else {
        const lastSent = new Date(inv.lastReminderSentAt);
        const hoursSince = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
        if (hoursSince >= 48) reminderCandidates.push(inv);
      }
    }
  }

  // Fire reminders
  for (const inv of reminderCandidates) {
    await sendReminderNow(inv);
    const allInvoices = getInvoices();
    const updated = allInvoices.map(i => i.id === inv.id ? {
      ...i,
      reminderSent: true,
      lastReminderSentAt: new Date().toISOString(),
      followupCount: (i.followupCount || 0) + 1,
    } : i);
    persist(INVOICES_KEY, updated);
  }
}