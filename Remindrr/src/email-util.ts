export async function sendReminderNow(invoice: Invoice): Promise<{ success: boolean; message: string }> {
  const settings = getSettings();

  if (!settings?.sendgridApiKey || !settings?.sendgridFromEmail) {
    return { success: false, message: 'Email not configured. Go to Settings to set up SendGrid.' };
  }

  const client = getClients().find(c => c.phaseId === invoice.clientId);
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
        subject: `Invoice Reminder: $${invoice.amount} due ${new Date(invoice.dueDate).toLocaleDateString()}`,
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

function buildEmailHtml(invoice: Invoice, client: Client | undefined, businessName: string) {
  const due = new Date(invoice.dueDate).toLocaleDateString();
  const amount = invoice.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const payLink = invoice.paymentLink || 'https://pay.remindrr.app';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#1e293b;">
  <div style="background:#6b21a8;padding:32px 24px;text-align:center;border-radius:16px 16px 0 0;">
    <h1 style="margin:0;color:#fff;font-size:24px;">${businessName || 'Invoice Reminder'}</h1>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:32px 24px 40px;border-radius:0 0 16px 16px;">
    <p style="margin:0 0 16px;font-size:16px;">Hi ${client?.name || 'there'},</p>
    <p style="margin:0 0 24px;font-size:16px;">This is a friendly reminder that your invoice is due.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Amount Due</p>
      <p style="margin:0;font-size:36px;font-weight:bold;color:#6b21a8;">${amount}</p>
      <p style="margin:8px 0 0;font-size:14px;color:#64748b;">Due: ${due}</p>
    </div>
    <p style="margin:0 0 24px;font-size:16px;">${invoice.description}</p>
    <a href="${payLink}" style="display:block;text-align:center;background:#6b21a8;color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">Pay Now →</a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;">Powered by Remindrr</p>
  </div>
</body></html>`;
}