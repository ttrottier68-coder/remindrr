const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { to, message, from, accountSid, authToken } = JSON.parse(event.body);
    
    // Make Twilio API request directly
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const postData = JSON.stringify({
      Body: message,
      From: from,
      To: to,
    });

    const options = {
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 201 || res.statusCode === 200) {
            resolve({ statusCode: 200, body: JSON.stringify({ success: true }) });
          } else {
            resolve({ statusCode: 500, body: data });
          }
        });
      });
      req.on('error', () => {
        resolve({ statusCode: 500, body: JSON.stringify({ error: 'Request failed' }) });
      });
      req.write(postData);
      req.end();
    });
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};