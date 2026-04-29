const twilio = require('twilio');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { to, message, from, accountSid, authToken } = JSON.parse(event.body);
    
    const client = twilio(accountSid, authToken);
    
    await client.messages.create({
      body: message,
      to: to,
      from: from,
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'SMS sent!' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};