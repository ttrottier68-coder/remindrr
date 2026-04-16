export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  createdAt: string;
  preferredReminder?: 'sms' | 'email' | 'both';
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentLink?: string;
  paidAt?: string;
  createdAt: string;
  reminderSent?: boolean;
  reminderMethod?: 'sms' | 'email' | 'both';
}

export interface Reminder {
  id: string;
  invoiceId: string;
  sentAt: string;
  type: 'due_soon' | 'overdue';
}

export interface UserSettings {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  stripeAccountId?: string;
  twilioSid?: string;
  twilioToken?: string;
  twilioPhone?: string;
  sendgridApiKey?: string;
  sendgridFromEmail?: string;
  plan: 'starter' | 'pro' | 'business';
}
