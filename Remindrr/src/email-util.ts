import type { Invoice, Client, UserSettings } from './types';
import { getSettings, getClients, getPaymentSettings, buildStripePayLink } from './lib/reminder-data';

export async function sendReminderNow(invoice: Invoice): Promise<{ success: boolean; message: string }> {
  const settings = getSettings();

  if (!settings?.sendgridApiKey || !settings?.sendgridFromEmail) {
    return { success: false, message: 'Email not configured. Go to Settings.' };
  }

  const client = getClients().find(c => c.id === invoice.clientId);
  const clientEmail = client?.email || invoice.clientEmail;

  if (!clientEmail) {
    return { success: false, message: 'No email found for this client.' };
  }

  try {
    const response = await fetch(`/.netlify/functions/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: settings.sendgridApiKey,
        fromEmail: settings.sendgridFromEmail,
        toEmail: clientEmail,
        subject: `Payment Reminder: Invoice #${invoice.id.slice(0, 8)} for $${invoice.amount}`,
        html: buildEmailHtml(invoice, client, settings.businessName, settings),
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Reminder sent!' };
    } else {
      const data = await response.json().catch(() => ({}));
      return { success: false, message: data.message || 'Failed to send reminder.' };
    }
  } catch {
    return { success: false, message: 'Could not connect. Check your email settings.' };
  }
}

export function buildEmailHtml(invoice: Invoice, client: Client | undefined, businessName: string, _settings: UserSettings) {
  const payments = getPaymentSettings(); // always read fresh from localStorage
  const due = new Date(invoice.dueDate).toLocaleDateString();
  const amount = invoice.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const payLink = invoice.paymentLink || '';
  const business = businessName || 'Invoice Reminder';
  const clientName = client?.name || 'there';
  const description = invoice.description || 'your invoice';
  const invoiceId = invoice.id.slice(0, 8);

  // ── Stripe "Pay Now" button ──────────────────────────────────────────────────
  let stripeSection = '';
  if (payments.stripeAccountId) {
    const stripeUrl = buildStripePayLink(
      payments.stripeAccountId,
      invoice.amount,
      business,
      invoiceId,
      `${description} #${invoiceId}`,
    );
    stripeSection = `
    <div style="margin:0 0 16px;">
      <a href="${stripeUrl}" style="display:block;text-align:center;background:#6366f1;color:#fff;padding:16px 24px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;letter-spacing:0.3px;">
        💳&nbsp;&nbsp;Pay Now with Card
      </a>
    </div>`;
  }

  // ── Custom payment link (fallback if no Stripe) ───────────────────────────────
  const payOnlineSection = (payLink && !payments.stripeAccountId) ? `
    <div style="margin:0 0 16px;">
      <a href="${payLink}" style="display:block;text-align:center;background:#6366f1;color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin:0 0 24px;">Pay Online (Credit/Debit) →</a>
    </div>` : '';

  // ── PayPal section ──────────────────────────────────────────────────────────
  const paypalSection = payments.paypalMe ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#0070ba;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">PayPal</div>
      <a href="${payments.paypalMe}" style="color:#0070ba;font-weight:600;font-size:14px;text-decoration:none;">${payments.paypalMe} →</a>
    </div>` : '';

  // ── Venmo section ───────────────────────────────────────────────────────────
  const venmoSection = payments.venmoUsername ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#3d95ce;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">Venmo</div>
      <span style="color:#1e293b;font-size:14px;"><strong>${payments.venmoUsername}</strong> <span style="color:#64748b;font-size:12px;">— scan in the Venmo app</span></span>
    </div>` : '';

  // ── Zelle section ───────────────────────────────────────────────────────────
  const zelleSection = payments.zelleInfo ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#6d1a8a;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">Zelle</div>
      <span style="color:#1e293b;font-size:14px;">Send to: <strong>${payments.zelleInfo}</strong></span>
    </div>` : '';

  const paymentMethodsSection = (paypalSection || venmoSection || zelleSection) ? `
    <div style="margin:0 0 24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Or pay with</p>
      ${paypalSection}${venmoSection}${zelleSection}
    </div>` : '';

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
      <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">Invoice #${invoiceId}</p>
    </div>
    <p style="margin:0 0 20px;font-size:16px;">${description}</p>
    ${stripeSection}
    ${payOnlineSection}
    ${paymentMethodsSection}
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">Powered by Remindrr</p>
  </div>
</body></html>`;
}
