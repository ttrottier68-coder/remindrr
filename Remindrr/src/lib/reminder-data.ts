import type { Invoice, Client, UserSettings } from '../types';

export type { UserSettings };

const SETTINGS_KEY = 'remindrr_settings';
const INVOICES_KEY = 'remindrr_invoices';
const CLIENTS_KEY  = 'remindrr_clients';
const DATA_SERVER  = 'https://remindrr.onrender.com';

function safe<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function persist(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getSettings(): UserSettings {
  return safe(SETTINGS_KEY, { businessName: '', ownerName: '', email: '', phone: '', plan: 'starter', twilioSid: '', twilioToken: '', twilioPhone: '' });
}

export function saveSettings(s: Partial<UserSettings>) {
  const prev = getSettings();
  const next = { ...prev, ...s };
  persist(SETTINGS_KEY, next);
  syncSettingsToServer(next);
  return next;
}

function syncSettingsToServer(settings: UserSettings) {
  fetch(`${DATA_SERVER}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoices: [], settings }),
  }).catch(() => {});
}

export function syncInvoicesToServer(invoices: Invoice[]) {
  const settings = getSettings();
  fetch(`${DATA_SERVER}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoices, settings }),
  }).catch(() => {});
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
  const settings = getSettings();
  
  // Check if Twilio is configured
  const twilioSid = settings.twilioSid;
  const twilioToken = settings.twilioToken;
  const twilioPhone = settings.twilioPhone;
  
  if (!twilioSid || !twilioToken || !twilioPhone) {
    return { success: false, message: 'Twilio not configured. Go to Settings to set up SMS.' };
  }

  const client = getClients().find(c => c.id === invoice.clientId);
  const phone = client?.phone || invoice.clientPhone;
  
  // Ensure phone number is in E.164 format
  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
  };
  
  const fromNumber = formatPhone(twilioPhone);
  const toNumber = formatPhone(phone);
  
  if (!phone) {
    return { success: false, message: 'No phone number found for this client.' };
  }
  
  // Don't send if To and From are the same
  if (toNumber === fromNumber) {
    return { success: false, message: 'Cannot send to your own number. Add a different client phone.' };
  }

  // Call Twilio API directly from browser
  console.log('Twilio config:', { twilioSid, fromNumber, toNumber });
  try {
    const auth = btoa(`${twilioSid}:${twilioToken}`);
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        Body: `Hi ${client?.name || 'there'}, this is a reminder that your invoice for $${invoice.amount} is due. Please pay at: ${invoice.paymentLink || 'your payment link'}`,
        From: fromNumber,
        To: toNumber,
      }),
    });
    try {
      const data = await response.json();
      console.log('Twilio response:', response.status, response.statusText, data);
      
      if (response.ok || response.status === 201) {
        return { success: true, message: 'Reminder sent!' };
      } else {
        return { success: false, message: data.message || 'Failed to send reminder' };
      }
    } catch (e) {
      console.log('Twilio error:', e);
      return { success: false, message: 'Twilio auth failed - check credentials' };
    }
    // Network error or CORS issue
    return { success: false, message: 'Could not connect. Check CORS settings in Twilio.' };
  }
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
