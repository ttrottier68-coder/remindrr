import type { Invoice, Client, UserSettings } from '../types';

export type { UserSettings };

const SETTINGS_KEY = 'remindrr_settings';
const INVOICES_KEY = 'remindrr_invoices';
const CLIENTS_KEY  = 'remindrr_clients';
const SENDGRID_KEY = 'remindrr_sendgrid'; // Separate key for SendGrid - persists on logout

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
  
  // Load SendGrid from separate key (persists on logout)
  const sendgridStored = safe(SENDGRID_KEY, { apiKey: '', fromEmail: '' });
  
  // Merge: use SendGrid from separate key if available
  return {
    ...mainSettings,
    sendgridApiKey: sendgridStored.apiKey || mainSettings.sendgridApiKey,
    sendgridFromEmail: sendgridStored.fromEmail || mainSettings.sendgridFromEmail,
  };
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
  persist(INVOICES_KEY, [...all, inv]);
}

export function markInvoicePaid(id: string) {
  const all = getInvoices().map(i => i.id === id ? { ...i, status: 'paid' as const, paidAt: new Date().toISOString() } : i);
  persist(INVOICES_KEY, all);
}

export async function sendReminderNow(invoice: Invoice): Promise<{ success: boolean; message: string }> {
  // Debug: Console log BEFORE alert
  console.log('=== sendReminderNow START ===');
  console.log('invoice:', invoice);
  
  const settings = getSettings();
  console.log('settings from getSettings():', settings);
  console.log('sendgridApiKey:', settings?.sendgridApiKey);
  console.log('sendgridFromEmail:', settings?.sendgridFromEmail);
  
  // Debug: Show what's loaded - create a visible element
  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-output';
  debugDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#ff0;color:#000;padding:10px;font-size:14px;z-index:99999;font-family:monospace;';
  debugDiv.textContent = 'DEBUG: apiKey=' + (settings.sendgridApiKey || 'EMPTY') + ', fromEmail=' + (settings.sendgridFromEmail || 'EMPTY');
  document.body.appendChild(debugDiv);

  if (!settings.sendgridApiKey || !settings.sendgridFromEmail) {
    const msg = 'Email not configured. Go to Settings.';
    window.alert(msg);
    return { success: false, message: msg };
  }

  const client = getClients().find(c => c.id === invoice.clientId);
  const clientEmail = client?.email || invoice.clientEmail;
  
  window.alert('Sending to: ' + clientEmail);
  
  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: settings.sendgridApiKey,
        fromEmail: settings.sendgridFromEmail,
        toEmail: clientEmail,
        subject: `Payment Reminder: Invoice #${invoice.id.slice(0, 8)} for $${invoice.amount}`,
        html: buildEmailHtml(invoice, client, settings.businessName),
      }),
    });

    window.alert('Response status: ' + response.status);
    window.alert('response.ok: ' + response.ok);

    if (response.ok) {
      console.log('=== SUCCESS PATH ===');
      // Track that reminder was sent
      const invoices = getInvoices();
      const updated = invoices.map(i => i.id === invoice.id ? { ...i, reminderSent: true, lastReminderSentAt: new Date().toISOString() } : i);
      persist(INVOICES_KEY, updated);
      syncInvoicesToServer(updated);
      return { success: true, message: 'Reminder sent!' };
    } else {
      console.log('=== ERROR PATH (response.ok false) ===');
      const data = await response.json().catch(() => ({}));
      window.alert('Error response: ' + response.status + ' - ' + JSON.stringify(data));
      return { success: false, message: data.message || 'Failed to send reminder.' };
    }
  } catch (error) {
    console.log('=== CATCH BLOCK === error: ' + error);
    window.alert('Connection error: ' + error);
    return { success: false, message: 'Could not connect. Check your Resend settings.' };
  }
}

function buildEmailHtml(invoice: Invoice, client: Client | undefined, businessName: string) {
  const due = new Date(invoice.dueDate).toLocaleDateString();
  const amount = invoice.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const payLink = invoice.paymentLink || 'https://pay.remindrr.app';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#1e293b;">
  <div style="background:#6366f1;padding:32px 24px;text-align:center;border-radius:16px 16px 0 0;">
    <h1 style="margin:0;color:#fff;font-size:24px;">${businessName || 'Invoice Reminder'}</h1>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:32px 24px 40px;border-radius:0 0 16px 16px;">
    <p style="margin:0 0 16px;font-size:16px;">Hi ${client?.name || 'there'},</p>
    <p style="margin:0 0 24px;font-size:16px;">This is a friendly reminder that your invoice is due.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Amount Due</p>
      <p style="margin:0;font-size:36px;font-weight:bold;color:#6366f1;">${amount}</p>
      <p style="margin:8px 0 0;font-size:14px;color:#64748b;">Due: ${due}</p>
    </div>
    <p style="margin:0 0 24px;font-size:16px;">${invoice.description}</p>
    <a href="${payLink}" style="display:block;text-align:center;background:#6366f1;color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">Pay Now →</a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;">Powered by Remindrr</p>
  </div>
</body>
</html>`;
}

export function deleteInvoice(id: string) {
  persist(INVOICES_KEY, getInvoices().filter(i => i.id !== id));
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
    console.log('Synced to Firestore');
  } catch (e) {
    console.error('Sync to Firestore failed:', e);
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
    console.error('Load from Firestore failed:', e);
    return { settings: null, invoices: null, clients: null };
  }
}