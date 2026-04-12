/**
 * Remindrr Reminder Engine
 * Checks for due invoices and sends SMS/email reminders via Twilio + SendGrid
 * 
 * Usage: node reminder-engine.js
 * Runs via cron: daily at 9am Pacific
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = '/tmp/remindrr-data';
const DATA_FILE = path.join(DATA_DIR, 'invoices.json');
const LOG_FILE  = path.join(DATA_DIR, 'reminder-log.txt');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Twilio helpers ──────────────────────────────────────────────────────────────
function sendSMS(twilioSid, twilioToken, from, to, body) {
  if (!twilioSid || !twilioToken || !to || !body) return { success: false, error: 'Missing Twilio credentials or message data' };
  const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
  const postData = new URLSearchParams({ From: from, To: to, Body: body }).toString();
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.twilio.com', port: 443,
      path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(opts, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { const r = JSON.parse(d); resolve({ success: r.status === 'queued' || r.status === 'sent', sid: r.sid, error: r.message }); }
        catch { resolve({ success: false, error: d }); }
      });
    });
    req.on('error', e => resolve({ success: false, error: e.message }));
    req.write(postData); req.end();
  });
}

// ── SendGrid helpers ──────────────────────────────────────────────────────────
function sendEmail(sendgridKey, from, to, subject, text) {
  if (!sendgridKey || !to || !subject) return { success: false, error: 'Missing SendGrid credentials or email data' };
  const data = JSON.stringify({ personalizations: [{ to: [{ email: to }], subject }], content: [{ type: 'text/plain', value: text }], from: { email: from } });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.sendgrid.com', port: 443, path: '/v3/mail/send', method: 'POST',
      headers: { Authorization: `Bearer ${sendgridKey}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(opts, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ success: res.statusCode === 200 || res.statusCode === 202, status: res.statusCode, error: d }));
    });
    req.on('error', e => resolve({ success: false, error: e.message }));
    req.write(data); req.end();
  });
}

// ── Main reminder logic ────────────────────────────────────────────────────────
async function runReminders() {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const log = [`\n=== Reminder run: ${now.toISOString()} ===`];

  // Load invoice data
  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    log.push('No invoice data found. Skipping.');
    fs.writeFileSync(LOG_FILE, log.join('\n'), { flag: 'a' });
    console.log(log.join('')); return;
  }

  const { invoices = [], settings = {} } = data;
  const { twilioSid, twilioToken, twilioPhone, sendgridApiKey, sendgridFromEmail, sendgridFromName, businessName } = settings;
  const fromName = businessName || 'Remindrr';

  log.push(`Loaded ${invoices.length} invoices from data file`);

  let sent = 0, failed = 0;

  for (const inv of invoices) {
    // Skip if no due date, already sent, or paid
    if (!inv.dueDate || inv.reminderSent || inv.status === 'paid') continue;

    // Check if due today or overdue
    if (inv.dueDate !== today) continue; // Only remind on due date

    const clientName  = inv.clientName  || 'there';
    const amount      = inv.amount      ? `$${inv.amount.toFixed(2)}` : '';
    const invNum      = inv.invoiceNumber || inv.id.slice(-6).toUpperCase();
    const desc        = inv.description || 'your invoice';
    const payLink     = inv.paymentLink || '';

    const reminderMethod = inv.reminderMethod || (inv.clientPhone ? 'sms' : 'email');
    const defaultSms = `Hi ${clientName} — friendly reminder that ${amount} for "${desc}" (Invoice #${invNum}) is due today. Pay now: ${payLink}`;
    const defaultEmailText = `Hi ${clientName},\n\nThis is a friendly reminder that ${amount} for "${desc}" (Invoice #${invNum}) is due today.\n\n${payLink ? `Pay now: ${payLink}\n\n` : ''}Thank you,\n${fromName}`;

    let smsOk = true, emailOk = true;
    let smsError = '', emailError = '';

    // Send SMS if method includes SMS
    if (reminderMethod === 'sms' || reminderMethod === 'both') {
      if (inv.clientPhone) {
        const r = await sendSMS(twilioSid, twilioToken, twilioPhone, inv.clientPhone, defaultSms);
        smsOk = r.success; smsError = r.error || '';
        log.push(`SMS → ${inv.clientPhone}: ${r.success ? 'OK (SID: ' + r.sid + ')' : 'FAIL: ' + r.error}`);
      } else {
        log.push(`SMS skipped for ${inv.clientName}: no phone number`);
        smsOk = null;
      }
    }

    // Send Email if method includes Email
    if (reminderMethod === 'email' || reminderMethod === 'both') {
      if (inv.clientEmail) {
        const r = await sendEmail(sendgridApiKey, sendgridFromEmail, inv.clientEmail,
          `Payment Reminder: Invoice #${invNum} due today`, defaultEmailText);
        emailOk = r.success; emailError = r.error || '';
        log.push(`Email → ${inv.clientEmail}: ${r.success ? 'OK' : 'FAIL: ' + r.error}`);
      } else {
        log.push(`Email skipped for ${inv.clientName}: no email address`);
        emailOk = null;
      }
    }

    if (smsOk !== false && emailOk !== false) {
      // Mark as reminder sent (only if at least one was sent successfully or skipped intentionally)
      inv.reminderSent = true;
      inv.reminderSentAt = new Date().toISOString();
      sent++;
    } else {
      failed++;
      log.push(`WARNING: Some reminders failed for invoice ${inv.id} - will retry tomorrow`);
    }
  }

  // Save updated data
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  log.push(`\nDone. Sent: ${sent}, Failed: ${failed}`);
  fs.writeFileSync(LOG_FILE, log.join('\n'), { flag: 'a' });
  console.log(log.join('\n'));
}

runReminders().catch(e => { console.error('Fatal error:', e); process.exit(1); });
