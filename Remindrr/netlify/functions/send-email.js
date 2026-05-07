exports.handler = async (event) => {
  console.log('Event received, method:', event.httpMethod);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid JSON: ' + e.message }) };
  }

  const { apiKey, fromEmail, toEmail, subject, html, text } = body;
  console.log('Processing: fromEmail=' + fromEmail + ', toEmail=' + toEmail);

  if (!apiKey || !fromEmail || !toEmail) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ success: false, message: 'Missing required fields' }) 
    };
  }

  // Determine if it's Resend or SendGrid based on key format
  if (apiKey.startsWith('re_')) {
    // Use Resend API
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: subject || 'Invoice Reminder',
          html: html || '<p>' + (text || 'Invoice reminder') + '</p>',
        }),
      });

      const data = await response.json();
      console.log('Resend response:', response.status, data);

      if (response.ok) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Email sent!' }),
        };
      } else {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ success: false, message: data.message || 'Resend error' }),
        };
      }
    } catch (error) {
      console.error('Resend error:', error.message);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Could not connect: ' + error.message }),
      };
    }
  } else {
    // Use SendGrid API (legacy)
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: fromEmail },
          subject: subject || 'Invoice Reminder',
          content: [
            { type: 'text/plain', value: text || 'Invoice reminder' },
            { type: 'text/html', value: html || '<p>Invoice reminder</p>' },
          ],
        }),
      });

      console.log('SendGrid response status:', response.status);

      if (response.ok || response.status === 202) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Email sent!' }),
        };
      } else {
        const errorText = await response.text();
        console.log('SendGrid error:', errorText);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ success: false, message: 'SendGrid error: ' + errorText.substring(0, 200) }),
        };
      }
    } catch (error) {
      console.error('Error:', error.message);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Could not connect: ' + error.message }),
      };
    }
  }
};