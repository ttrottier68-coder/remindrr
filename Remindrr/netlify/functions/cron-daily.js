// Netlify Function: cron-daily.js
// Runs once per day (via cron-job.org, GitHub Actions, or any external
// scheduler) and fires automatic reminders for any user with overdue or
// due-soon invoices.
//
// Required env vars:
//   FIREBASE_SERVICE_ACCOUNT — base64-encoded service account JSON from
//     Firebase Console → Project settings → Service accounts → Generate
//     new private key. Encode the file with:
//       base64 -i service-account.json | tr -d '\n'
//   CRON_SECRET — any random string; clients must send it in
//     ?secret=... to invoke the function. Protects from public abuse.
//
// To schedule:
//   1. Go to https://cron-job.org (free) and create an account
//   2. Add a job that hits:
//        https://remindrr.app/.netlify/functions/cron-daily?secret=YOUR_SECRET
//      every day at a time that makes sense for your users (e.g. 9am UTC)
//   3. (Or use GitHub Actions with a cron schedule, or Netlify Scheduled
//      Functions if you're on Pro+)
//
// Returns:
//   { ok: true, users: N, reminders: M, errors: [...] }

const admin = require('firebase-admin');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Lazy-init Firebase Admin so the function can be imported without
// crashing on cold start if env vars aren't set.
let adminApp = null;

function getAdmin() {
  if (adminApp) return adminApp;
  const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saB64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set. See function comment for setup instructions.');
  }
  let sa;
  try {
    const json = Buffer.from(saB64, 'base64').toString('utf-8');
    sa = JSON.parse(json);
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid base64-encoded JSON: ' + e.message);
  }
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(sa),
  }, 'remindrr-cron');
  return adminApp;
}

// ── Email-sending helper (mirrors src/email-util.ts buildEmailHtml) ──

function buildEmailHtml({ businessName, clientName, amount, due, description, invoiceId, payments }) {
  const business = businessName || 'Remindrr';
  const paypalSection = (payments.paypalMe && payments.paypalEnabled) ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#0070ba;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">PayPal</div>
      <a href="${payments.paypalMe}" style="color:#0070ba;font-weight:600;font-size:14px;text-decoration:none;">${payments.paypalMe} →</a>
    </div>` : '';
  const venmoSection = (payments.venmoUsername && payments.venmoEnabled) ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#3d95ce;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">Venmo</div>
      <span style="color:#1e293b;font-size:14px;"><strong>${payments.venmoUsername}</strong> <span style="color:#64748b;font-size:12px;">— scan in the Venmo app</span></span>
    </div>` : '';
  const zelleSection = (payments.zelleInfo && payments.zelleEnabled) ? `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f0f4ff;border:1px solid #dde4ff;border-radius:10px;margin-bottom:8px;">
      <div style="background:#6d1a8a;color:#fff;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:6px;white-space:nowrap;">Zelle</div>
      <span style="color:#1e293b;font-size:14px;">Send to: <strong>${payments.zelleInfo}</strong></span>
    </div>` : '';
  const hasPaymentMethods = paypalSection || venmoSection || zelleSection;
  const paymentMethodsSection = hasPaymentMethods ? `
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
    ${paymentMethodsSection}
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">Powered by Remindrr</p>
  </div>
</body></html>`;
}

async function sendViaSendgrid({ apiKey, fromEmail, toEmail, subject, html }) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail },
      subject,
      content: [
        { type: 'text/plain', value: 'Payment reminder — please view in HTML email client.' },
        { type: 'text/html', value: html },
      ],
    }),
  });
  if (!res.ok && res.status !== 202) {
    const errText = await res.text();
    throw new Error('SendGrid ' + res.status + ': ' + errText.substring(0, 200));
  }
}

// ── Main ──

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  // Auth: require the secret in query string or body
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'CRON_SECRET env var not set' }) };
  }
  const provided =
    (event.queryStringParameters && event.queryStringParameters.secret) ||
    (event.body && (() => { try { return JSON.parse(event.body).secret; } catch { return null; } })());
  if (provided !== secret) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'Invalid or missing secret' }) };
  }

  // Init Firebase Admin
  let db;
  try {
    const app = getAdmin();
    db = app.firestore();
  } catch (e) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: e.message }) };
  }

  // Walk all users
  const errors = [];
  let userCount = 0;
  let reminderCount = 0;
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;

  try {
    const usersSnap = await db.collection('users').get();
    for (const userDoc of usersSnap.docs) {
      userCount++;
      try {
        const uid = userDoc.id;
        const [settingsDoc, invoicesDoc, clientsDoc] = await Promise.all([
          userDoc.ref.collection('data').doc('settings').get(),
          userDoc.ref.collection('data').doc('invoices').get(),
          userDoc.ref.collection('data').doc('clients').get(),
        ]);

        if (!settingsDoc.exists) continue;
        const settings = settingsDoc.data();
        if (!settings || !settings.sendgridApiKey || !settings.sendgridFromEmail) continue;

        if (!invoicesDoc.exists) continue;
        const invoicesData = invoicesDoc.data();
        const invoices = (invoicesData && invoicesData.list) || [];
        if (invoices.length === 0) continue;

        const clients = (clientsDoc.exists && clientsDoc.data() && clientsDoc.data().list) || [];

        for (const inv of invoices) {
          if (inv.status === 'paid') continue;

          const due = new Date(inv.dueDate);
          const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

          // Only send if due in <=1 day OR overdue
          if (daysUntil > 1) continue;

          // Throttle: don't send if last reminder was <48h ago
          if (inv.lastReminderSentAt) {
            const lastSent = new Date(inv.lastReminderSentAt);
            const hoursSince = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
            if (hoursSince < 48) continue;
          }

          const client = clients.find(c => c.id === inv.clientId);
          const clientEmail = (client && client.email) || inv.clientEmail;
          if (!clientEmail) continue;

          const clientName = (client && client.name) || inv.clientName || 'there';
          const amount = Number(inv.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          const dueStr = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const invoiceIdShort = String(inv.id).slice(0, 8);
          const description = inv.description || 'your invoice';

          const subject = `Payment Reminder: Invoice #${invoiceIdShort} for ${amount}`;
          const html = buildEmailHtml({
            businessName: settings.businessName,
            clientName,
            amount,
            due: dueStr,
            description,
            invoiceId: invoiceIdShort,
            payments: {
              paypalMe: settings.paypalMe,
              paypalEnabled: settings.paypalEnabled,
              venmoUsername: settings.venmoUsername,
              venmoEnabled: settings.venmoEnabled,
              zelleInfo: settings.zelleInfo,
              zelleEnabled: settings.zelleEnabled,
            },
          });

          try {
            await sendViaSendgrid({
              apiKey: settings.sendgridApiKey,
              fromEmail: settings.sendgridFromEmail,
              toEmail: clientEmail,
              subject,
              html,
            });

            // Update invoice in Firestore
            const updated = invoices.map((i, idx) =>
              i.id === inv.id
                ? { ...i, reminderSent: true, lastReminderSentAt: now.toISOString(), followupCount: (i.followupCount || 0) + 1 }
                : i
            );
            await userDoc.ref.collection('data').doc('invoices').set({ list: updated });
            reminderCount++;
          } catch (sendErr) {
            errors.push(`uid=${uid} inv=${inv.id}: ${sendErr.message}`);
          }
        }
      } catch (userErr) {
        errors.push(`user ${userDoc.id}: ${userErr.message}`);
      }
    }
  } catch (e) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: e.message, errors }) };
  }

  return {
    statusCode: 200,
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      users: userCount,
      reminders: reminderCount,
      errors: errors.length > 0 ? errors : undefined,
      ranAt: now.toISOString(),
    }),
  };
};
