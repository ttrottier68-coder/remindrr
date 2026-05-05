exports.handler = async (event) => {
  console.log('Event received, method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid JSON: ' + e.message }) };
  }

  const { apiKey, fromEmail, toEmail, subject, html, text } = body;

  console.log('Received: apiKey=' + !!apiKey + ', fromEmail=' + fromEmail + ', toEmail=' + toEmail + ', hasHtml=' + !!html + ', hasText=' + !!text);

  if (!apiKey || !fromEmail || !toEmail) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ success: false, message: 'Missing required fields' }) 
    };
  }

  try {
    // Use SendGrid Web API v3 directly
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
        body: JSON.stringify({ success: true, message: 'Email sent!' }),
      };
    } else {
      const errorText = await response.text();
      console.log('SendGrid error response:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ success: false, message: 'SendGrid 403 - check API key permissions AND verify sender email in SendGrid settings. Raw: ' + errorText.substring(0, 200) }),
      };
    }
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message || 'Failed to send email' }),
    };
  }
};