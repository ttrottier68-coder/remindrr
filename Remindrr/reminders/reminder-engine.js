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

// Reminder configuration
const DAYS_BEFORE = 3;   // Send reminder X days before due
const DAYS_AFTER = 3;      // Send reminder X days after due (for overdue)
const RECUR_EVERY = 3;    // Send additional reminders every X days for stubborn overdue invoices

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
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
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
    // Skip if already paid
    if (inv.status === 'paid') continue;
    if (!inv.dueDate) continue;

    const dueDate = new Date(inv.dueDate);
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const daysUntilDue = Math.round((dueDateOnly.getTime() - today.getTime()) / 86400000);
    
    // Determine which reminder to send based on days until due
    let reminderType = null;
    
    if (daysUntilDue === DAYS_BEFORE) {
      reminderType = 'before';
    } else if (daysUntilDue === 0) {
      reminderType = 'on';
    } else if (daysUntilDue < 0 && daysUntilDue >= -DAYS_AFTER) {
      // Check if we should send overdue reminder
      const daysOverdue = Math.abs(daysUntilDue);
      const lastReminder = inv.lastReminderSentAt ? new Date(inv.lastReminderSentAt) : null;
      
      if (!lastReminder) {
        reminderType = 'after';
      } else {
        // Send follow-up reminders every X days for stubborn overdue
        const daysSinceLastReminder = Math.round((today.getTime() - lastReminder.getTime()) / 86400000);
        if (daysSinceLastReminder >= RECUR_EVERY) {
          reminderType = 'followup';
        }
      }
    }
    
    // Skip if no reminder needed today
    if (!reminderType) continue;
    
    // Skip if already sent this type of reminder (for before/on)
    if (inv.lastReminderType === reminderType && reminderType !== 'followup') continue;
    
    // Skip if already sent max follow-ups after due
    if (reminderType === 'followup' && inv.followupCount >= 3) continue;

    const clientName  = inv.clientName  || 'there';
    const amount      = inv.amount      ? `$${inv.amount.toFixed(2)}` : '';
    const invNum      = inv.invoiceNumber || inv.id.slice(-6).toUpperCase();
    const desc        = inv.description || 'your invoice';
    const payLink     = inv.paymentLink || '';

    const reminderMethod = inv.reminderMethod || (inv.clientPhone ? 'sms' : 'email');
    
    // Build message based on reminder type
    let smsText = '';
    let emailSubject = '';
    let emailText = '';
    
    if (reminderType === 'before') {
      const daysUntilDue = DAYS_BEFORE;
      smsText = `Hi ${clientName} 👋 Reminder: Your invoice of ${amount} for "${desc}" (Invoice #${invNum}) is due in ${daysUntilDue} days. Pay now to avoid late fees: ${payLink}`;
      emailSubject = `Upcoming: Invoice #${invNum} due in ${daysUntilDue} days`;
      emailText = `Hi ${clientName},\n\nThis is a friendly reminder that your invoice of ${amount} for "${desc}" (Invoice #${invNum}) is due in ${daysUntilDue} days.\n\nPay now to avoid late fees: ${payLink}\n\nThanks,\n${fromName}`;
    } else if (reminderType === 'on') {
      smsText = `Hi ${clientName} — friendly reminder that ${amount} for "${desc}" (Invoice #${invNum}) is due today. Pay now: ${payLink}`;
      emailSubject = `Payment Reminder: Invoice #${invNum} due today`;
      emailText = `Hi ${clientName},\n\nThis is a friendly reminder that ${amount} for "${desc}" (Invoice #${invNum}) is due today.\n\n${payLink ? `Pay now: ${payLink}\n\n` : ''}Thank you,\n${fromName}`;
    } else if (reminderType === 'after' || reminderType === 'followup') {
      const daysOverdue = Math.abs(daysUntilDue);
      const isFirstAfter = reminderType === 'after';
      smsText = `Hi ${clientName} ⚠️ Invoice #${invNum} of ${amount} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Please pay now to avoid additional fees: ${payLink}`;
      emailSubject = `OVERDUE: Invoice #${invNum} - ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} past due`;
      emailText = `Hi ${clientName},\n\nThis is an important reminder that your invoice of ${amount} for "${desc}" (Invoice #${invNum}) is now ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.\n\nPlease pay as soon as possible to avoid additional fees or service interruptions.\n\nPay now: ${payLink}\n\nThank you,\n${fromName}`;
    }

    let smsOk = true, emailOk = true;
    let smsError = '', emailError = '';

    // Send SMS if method includes SMS
    if (reminderMethod === 'sms' || reminderMethod === 'both') {
      if (inv.clientPhone) {
        const r = await sendSMS(twilioSid, twilioToken, twilioPhone, inv.clientPhone, smsText);
        smsOk = r.success; smsError = r.error || '';
        log.push(`SMS (${reminderType}) → ${inv.clientPhone}: ${r.success ? 'OK (SID: ' + r.sid + ')' : 'FAIL: ' + r.error}`);
      } else {
        log.push(`SMS skipped for ${inv.clientName}: no phone number`);
        smsOk = null;
      }
    }

    // Send Email if method includes Email
    if (reminderMethod === 'email' || reminderMethod === 'both') {
      if (inv.clientEmail) {
        const r = await sendEmail(sendgridApiKey, sendgridFromEmail, inv.clientEmail, emailSubject, emailText);
        emailOk = r.success; emailError = r.error || '';
        log.push(`Email (${reminderType}) → ${inv.clientEmail}: ${r.success ? 'OK' : 'FAIL: ' + r.error}`);
      } else {
        log.push(`Email skipped for ${inv.clientName}: no email address`);
        emailOk = null;
      }
    }

    if (smsOk !== false || emailOk !== false) {
      // Track reminder sent
      inv.lastReminderSentAt = new Date().toISOString();
      inv.lastReminderType = reminderType;
      if (reminderType === 'followup') {
        inv.followupCount = (inv.followupCount || 0) + 1;
      }
      sent++;
      log.push(`✓ ${reminderType} reminder sent for ${invNum}`);
    } else {
      failed++;
      log.push(`WARNING: Some reminders failed for invoice ${invNum} - will retry tomorrow`);
    }
  }

  // Save updated data
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  log.push(`\nDone. Sent: ${sent}, Failed: ${failed}`);
  fs.writeFileSync(LOG_FILE, log.join('\n'), { flag: 'a' });
  console.log(log.join('\n'));
}

runReminders().catch(e => { console.error('Fatal error:', e); process.exit(1); });
