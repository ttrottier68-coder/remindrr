const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  console.log('Event received:', event.httpMethod, event.body?.substring(0, 200));
  
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

  if (!apiKey || !fromEmail || !toEmail) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ success: false, message: 'Missing required fields: apiKey=' + !!apiKey + ', fromEmail=' + !!fromEmail + ', toEmail=' + !!toEmail }) 
    };
  }

  try {
    sgMail.setApiKey(apiKey);

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: subject || 'Invoice Reminder',
      html: html || '',
      text: text || '',
    };

    console.log('Sending email via SendGrid to:', toEmail);
    
    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email sent!' }),
    };
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.response?.body?.errors?.[0]?.message || error.message || 'Failed to send email' 
      }),
    };
  }
};