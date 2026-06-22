const https = require('https');

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const req = JSON.parse(event.body || '{}');
  const { to, from, message, accountSid, authToken } = req;

  if (!to || !from || !message || !accountSid || !authToken) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing required fields: to, from, message, accountSid, authToken' }) };
  }

  // Normalize phone numbers - ensure E.164 format
  const normalizePhone = (n) => {
    const digits = (n || '').replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits[0] === '1') return '+' + digits;
    return n || '';
  };

  const toNorm = normalizePhone(to);
  const fromNorm = normalizePhone(from);

  const postData = new URLSearchParams({
    To: toNorm,
    From: fromNorm,
    Body: message,
  }).toString();

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const opts = {
    hostname: 'api.twilio.com',
    path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'SMS sent!' }) });
        } else {
          resolve({ statusCode: res.statusCode || 500, headers, body: data });
        }
      });
    });
    req.on('error', (e) => resolve({ statusCode: 500, headers, body: JSON.stringify({ message: e.message }) }));
    req.write(postData);
    req.end();
  });
};
