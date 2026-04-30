import type { Invoice, Client, UserSettings } from '../types';

export type { UserSettings };

const SETTINGS_KEY = 'remindrr_settings';
const INVOICES_KEY = 'remindrr_invoices';
const CLIENTS_KEY  = 'remindrr_clients';

function safe<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function persist(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getSettings(): UserSettings {
  return safe(SETTINGS_KEY, {
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    plan: 'starter',
    sendgridApiKey: '',
    sendgridFromEmail: '',
  });
}

export function saveSettings(s: Partial<UserSettings>) {
  const prev = getSettings();
  const next = { ...prev, ...s };
  persist(SETTINGS_KEY, next);
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
  const settings = getSettings();

  if (!settings.sendgridApiKey || !settings.sendgridFromEmail) {
    return { success: false, message: 'Email not configured. Go to Settings to set up SendGrid.' };
  }

  const client = getClients().find(c => c.id === invoice.clientId);
  const clientEmail = client?.email || invoice.clientEmail;

  if (!clientEmail) {
    return { success: false, message: 'No email found for this client.' };
  }

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

    if (response.ok) {
      return { success: true, message: 'Reminder sent!' };
    } else {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data.message || 'Failed to send reminder.' };
    }
  } catch {
    return { success: false, message: 'Could not connect. Check your SendGrid settings.' };
  }
}

// Stub for server sync - implementation pending
export async function syncInvoicesToServer(): Promise<{ success: boolean; message: string }> {
  return { success: false, message: 'Server sync not yet implemented' };
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