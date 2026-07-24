// Branded password reset — uses the user's own SendGrid (or Resend) credentials
// to send a reset email that matches the rest of the app's branding.
//
// Flow:
//   1. Try to generate a password-reset link via Firebase (client-side).
//   2. If the user has SendGrid/Resend configured in their settings, build a
//      branded HTML template around the link and send it through our existing
//      /.netlify/functions/send-email endpoint.
//   3. If anything fails (no SendGrid creds, generatePasswordResetLink not
//      available, etc.), fall back to Firebase's built-in sendPasswordResetEmail
//      which sends a generic email itself.
//
// The branded path has a clear advantage: the "from" address is the user's
// own business email (not noreply@<project>.firebaseapp.com), so it lands in
// the inbox instead of spam.

import { getSettings } from './reminder-data';
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail, isFirebaseReady } from './firebase';

export type PasswordResetResult = { ok: true; via: 'sendgrid' | 'firebase' } | { ok: false; error: string };

const RESET_EMAIL_ENDPOINT = '/.netlify/functions/send-email';

function buildBrandedHtml(opts: {
  resetUrl: string;
  businessName: string;
  fromEmail: string;
}) {
  const { resetUrl, businessName, fromEmail } = opts;
  const business = businessName || 'Remindrr';
  const year = new Date().getFullYear();

  // Plain-text fallback (some clients prefer it)
  const text =
    `Hi,\n\n` +
    `We received a request to reset your ${business} password.\n\n` +
    `Click the link below to set a new password. This link expires in 1 hour.\n\n` +
    `${resetUrl}\n\n` +
    `If you didn't request this, you can safely ignore this email — your password will stay the same.\n\n` +
    `— The ${business} team\n` +
    `${fromEmail}`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1e293b;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
        <tr><td style="background:#6366f1;padding:32px 24px;text-align:center;border-radius:16px 16px 0 0;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">${escapeHtml(business)}</h1>
          <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Password reset</p>
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e2e8f0;border-top:none;padding:32px 24px 40px;border-radius:0 0 16px 16px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;">Hi,</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.55;">
            We received a request to reset the password for your <strong>${escapeHtml(business)}</strong> account.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td align="center" style="padding:8px 0 24px;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:12px;box-shadow:0 4px 12px rgba(249,115,22,0.25);">Reset your password</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Or copy and paste this link into your browser:</p>
          <p style="margin:0 0 24px;font-size:12px;color:#94a3b8;word-break:break-all;background:#f1f5f9;padding:12px 16px;border-radius:8px;font-family:'SF Mono',Monaco,Consolas,monospace;">${resetUrl}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;">
            <tr><td style="padding:12px 16px;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                <strong>This link expires in 1 hour.</strong> If you didn't request a password reset, you can safely ignore this email — your password will stay the same.
              </p>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
            Need help? Reply to this email and we'll get back to you.
          </p>
        </td></tr>
        <tr><td style="padding:20px 24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© ${year} ${escapeHtml(business)} · Powered by Remindrr</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send a password-reset email, preferring the user's own SendGrid (branded) and
 * falling back to Firebase's built-in sendPasswordResetEmail if SendGrid isn't
 * configured or any error occurs.
 */
export async function sendBrandedPasswordReset(email: string, continueUrl: string): Promise<PasswordResetResult> {
  const settings = getSettings();
  const hasSendgrid = !!(settings?.sendgridApiKey && settings?.sendgridFromEmail);

  // ── Try the branded SendGrid path ───────────────────────────────────────
  if (hasSendgrid && isFirebaseReady()) {
    try {
      // Generate the reset link client-side. If the email doesn't exist, this
      // throws auth/user-not-found, which we catch below and treat as "fall
      // back to Firebase" (and show success to the user to avoid email enumeration).
      const resetUrl: string = await (window as any).firebase
        .auth()
        .generatePasswordResetLink(email, { url: continueUrl, handleCodeInApp: false });

      const { html, text } = buildBrandedHtml({
        resetUrl,
        businessName: settings.businessName || 'Remindrr',
        fromEmail: settings.sendgridFromEmail,
      });

      const res = await fetch(RESET_EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.sendgridApiKey,
          fromEmail: settings.sendgridFromEmail,
          toEmail: email,
          subject: `Reset your ${settings.businessName || 'Remindrr'} password`,
          html,
          text,
        }),
      });

      if (res.ok) {
        return { ok: true, via: 'sendgrid' };
      }

      // If SendGrid rejects (e.g., unverified sender), fall through to Firebase
      const errBody = await res.json().catch(() => ({}));
      console.warn('[password-reset] SendGrid send failed, falling back to Firebase:', errBody);
    } catch (err: any) {
      // user-not-found here is expected when the email isn't registered;
      // we still want to show success to the user.
      if (err?.code !== 'auth/user-not-found') {
        console.warn('[password-reset] Branded path failed, falling back to Firebase:', err);
      }
    }
  }

  // ── Fallback: Firebase's built-in sendPasswordResetEmail ───────────────
  try {
    await firebaseSendPasswordResetEmail(email, continueUrl);
    return { ok: true, via: 'firebase' };
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      // Don't reveal whether email exists — treat as success
      return { ok: true, via: 'firebase' };
    }
    return {
      ok: false,
      error: err?.code || 'unknown',
    };
  }
}
