const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { apiKey, fromEmail, toEmail, subject, html, text } = JSON.parse(event.body);

    if (!apiKey || !fromEmail || !toEmail) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ success: false, message: 'Missing required fields: apiKey, fromEmail, or toEmail' }) 
      };
    }

    sgMail.setApiKey(apiKey);

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: subject || 'Invoice Reminder',
      html: html || '',
      text: text || '',
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email sent!' }),
    };
  } catch (error) {
    console.error('SendGrid error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.message || 'Failed to send email' 
      }),
    };
  }
};