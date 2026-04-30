const https = require('https');

exports.handler = async function(event) {
  const req = JSON.parse(event.body || '{}');
  if (!req.to || !req.from || !req.message) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Missing fields.' }) };
  }
  const payload = JSON.stringify({ personalizations: [{ to: [{ email: req.to }] }], from: { email: req.from }, subject: req.subject || 'Invoice Reminder', content: [{ type: 'text/html', value: req.message || '' }] });
  const opts = { hostname: 'api.sendgrid.com', path: '/v3/mail/send', method: 'POST', headers: { 'Authorization': 'Bearer ' + req.apiKey, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
  return new Promise(function(resolve) {
    const req = https.request(opts, function(res) { var d = ''; res.on('data', function(c) { d += c; }); res.on('end', function() { resolve({ statusCode: res.statusCode >= 200 ? 200 : res.statusCode, body: d }); }); });
    req.on('error', function(e) { resolve({ statusCode: 500, body: JSON.stringify({ message: e.message }) }); });
    req.write(payload); req.end();
  });
};