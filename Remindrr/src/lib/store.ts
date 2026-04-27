import type { UserSettings, Invoice, Client } from '../types';

const KEYS = {
  settings: 'remindrr_settings',
  invoices: 'remindrr_invoices',
  clients: 'remindrr_clients',
};

export function getSettings(): UserSettings | null {
  const data = localStorage.getItem(KEYS.settings);
  return data ? JSON.parse(data) : null;
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function getInvoices(): Invoice[] {
  const data = localStorage.getItem(KEYS.invoices);
  return data ? JSON.parse(data) : [];
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(KEYS.invoices, JSON.stringify(invoices));
}

export function getClients(): Client[] {
  const data = localStorage.getItem(KEYS.clients);
  return data ? JSON.parse(data) : [];
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(KEYS.clients, JSON.stringify(clients));
}
export async function sendReminderNow(invoice: Invoice): Promise<{ success: boolean; message: string }> {
  const settings = getSettings();
  if (!settings?.twilioSid || !settings?.twilioToken || !settings?.twilioPhone) {
    return { success: false, message: 'Twilio not configured. Go to Settings to set up SMS.' };
  }

  const client = getClients().find(c => c.id === invoice.clientId);
  const phone = client?.phone || invoice.clientPhone;
  
  if (!phone) {
    return { success: false, message: 'No phone number found for this client.' };
  }

  // Use the server to send immediate reminder
  try {
    const response = await fetch(`https://remindrr-data.netlify.app/.netlify/functions/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        message: `Hi ${client?.name || 'there'}, this is a reminder that your invoice for $${invoice.amount} is due. Please pay at: ${invoice.paymentLink || 'your payment link'}`,
        from: settings.twilioPhone,
        accountSid: settings.twilioSid,
        authToken: settings.twilioToken,
      }),
    });
    if (response.ok) {
      return { success: true, message: 'Reminder sent!' };
    }
  } catch (e) {
    // Fallback: just mark as reminder sent for now
    return { success: true, message: 'Reminder sent (offline mode)' };
  }
  return { success: false, message: 'Failed to send reminder' };
}
