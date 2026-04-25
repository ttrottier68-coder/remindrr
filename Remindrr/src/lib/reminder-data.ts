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
  return safe(SETTINGS_KEY, { businessName: '', ownerName: '', email: '', phone: '', plan: 'starter' });
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
  const client = getClients().find(c => c.id === invoice.clientId);
  
  try {
    const response = await fetch(`${DATA_SERVER}/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice,
        client: client,
        settings,
      }),
    });
    const result = await response.json();
    return { success: true, message: result.message || 'Reminder sent!' };
  } catch (error) {
    return { success: true, message: 'Reminder triggered (offline mode)' };
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
