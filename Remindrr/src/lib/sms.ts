// SMS utility — uses Twilio API via a backend proxy
// In production, calls would go through your server-side function

export interface SMSSendResult {
  success: boolean;
  sid?: string;
  error?: string;
}

// Simulated SMS send — replace with real Twilio API call
// POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
// Auth: Basic base64(AccountSid:AuthToken)
export async function sendSMS(
  to: string, // E.164 format: +1234567890
  body: string,
  twilioSid: string,
  twilioToken: string,
  fromNumber: string
): Promise<SMSSendResult> {
  // In production, this calls your backend which proxies to Twilio
  // For demo, we simulate success
  console.log(`[SMS] To: ${to}, Body: ${body}`);

  try {
    // Real Twilio call would look like:
    // const response = await fetch(
    //   `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     body: new URLSearchParams({ To: to, From: fromNumber, Body: body }),
    //   }
    // );

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, sid: 'SM' + Math.random().toString(36).substr(2, 9) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Check if due date is within N days
export function isDueSoon(dueDate: string, days = 3): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= days;
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

export function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
