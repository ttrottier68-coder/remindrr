export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
  preferredReminder?: 'email';
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  taxRate: number;
  taxName: string;
  subtotal: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentLink?: string;
  paidAt?: string;
  createdAt: string;
  reminderSent?: boolean;
  reminderMethod?: 'email';
}

export interface UserSettings {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  stripeAccountId?: string;
  stripeSecretKey?: string;
  twilioSid?: string;
  twilioToken?: string;
  twilioPhone?: string;
  sendgridApiKey?: string;
  sendgridFromEmail?: string;
  plan: 'trial' | 'starter' | 'pro' | 'business';
  trialStartDate?: string; // ISO date string when trial began
  paypalMe?: string;
  paypalEnabled?: boolean;
  venmoUsername?: string;
  venmoEnabled?: boolean;
  zelleInfo?: string;
  zelleEnabled?: boolean;
  interacEmail?: string;
  interacEnabled?: boolean;
  businessLogo?: string; // base64 data URL of uploaded logo image
}

// ── Trial helpers ──────────────────────────────────────────
export const TRIAL_DAYS = 14;

export function getTrialDaysLeft(settings: UserSettings): number {
  if (settings.plan !== 'trial' || !settings.trialStartDate) return 0;
  const elapsed = Date.now() - new Date(settings.trialStartDate).getTime();
  const daysLeft = Math.ceil(TRIAL_DAYS - elapsed / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
}
