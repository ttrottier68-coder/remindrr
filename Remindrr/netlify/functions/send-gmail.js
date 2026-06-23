// Netlify Function: send-gmail.js
// Sends email via Gmail API using a refresh token
// Token refresh is handled by gmail-oauth, so we expect a valid access_token

const CLIENT_ID = process.env.GMAIL_ID;
const CLIENT_SECRET = process.env.GMAIL_KEY;

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Decode base64url
function base64url(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
  }

  const { accessToken, toEmail, subject, text, html, fromEmail } = body;

  if (!accessToken || !toEmail) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ success: false, message: 'Missing accessToken or toEmail' }) };
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ success: false, message: 'Gmail OAuth not configured' }) };
  }

  // Build RFC 2822 email
  const emailLines = [
    `To: ${toEmail}`,
    `From: ${fromEmail || 'me'}`,
    `Subject: ${subject || 'Invoice Reminder'}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    html || `<p>${text || 'Invoice reminder'}</p>`,
  ];
  const raw = base64url(Buffer.from(emailLines.join('\r\n')).toString('base64'));

  let res;
  try {
    res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ success: false, message: 'Gmail API request failed: ' + err.message }) };
  }

  if (res.ok) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ success: true, message: 'Email sent via Gmail!' }),
    };
  }

  // If 401, token expired — tell frontend to re-auth
  if (res.status === 401) {
    return {
      statusCode: 401,
      headers: HEADERS,
      body: JSON.stringify({ success: false, message: 'Gmail token expired — please reconnect Gmail in Settings' }),
    };
  }

  const errData = await res.json().catch(() => ({}));
  const errMsg = errData?.error?.message || errData?.error?.errors?.[0]?.message || 'Gmail API error';
  return {
    statusCode: res.status,
    headers: HEADERS,
    body: JSON.stringify({ success: false, message: 'Gmail error: ' + errMsg }),
  };
};
