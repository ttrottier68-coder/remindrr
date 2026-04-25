import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveInvoice, saveClient, saveSettings, getSettings } from ''../lib/data-store;
import type { Invoice, Client } from '../types';

// ─── Icons ──────────────────────────────────────────────────────────────────
const CheckCircleIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2 2 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const SparkleIcon = () => (
  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

// ─── Progress Bar ───────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i <= step ? 'bg-orange-500 w-6' : 'bg-slate-200 w-6'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center px-2">
      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-6">
        R
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome to Remindrr</h1>
      <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">
        Let's get you paid faster in the next 3 minutes.
      </p>
      <button
        onClick={onNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
      >
        Get Started
        <ArrowRightIcon />
      </button>
    </div>
  );
}

// ─── Step 1: Quick Setup ─────────────────────────────────────────────────────
function QuickSetupStep({
  onNext,
  initialData,
}: {
  onNext: (data: { ownerName: string; businessName: string; phone: string }) => void;
  initialData: { ownerName: string; businessName: string; email: string };
}) {
  const [ownerName, setOwnerName] = useState(initialData.ownerName);
  const [businessName, setBusinessName] = useState(initialData.businessName);
  const [phone, setPhone] = useState('');

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Set up your account</h2>
        <p className="text-slate-400 text-sm">Tell us a bit about your business.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
        <input
          value={ownerName}
          onChange={e => setOwnerName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
        <input
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          placeholder="Smith Plumbing"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <button
        onClick={() => ownerName && onNext({ ownerName, businessName, phone })}
        disabled={!ownerName}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
      >
        Continue
        <ArrowRightIcon />
      </button>
    </div>
  );
}

// ─── Step 2: Create First Invoice ───────────────────────────────────────────
function CreateInvoiceStep({
  onNext,
}: {
  onNext: (data: { customerName: string; customerPhone: string; customerEmail: string; description: string; amount: string; dueDate: string }) => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const isValid = customerName && (customerPhone || customerEmail) && description && amount && dueDate;

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your first invoice</h2>
        <p className="text-slate-400 text-sm">You can edit this anytime.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Name</label>
        <input
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          placeholder="Acme Corp"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Phone (for SMS reminders)</label>
        <input
          type="tel"
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Email (for email reminders)</label>
        <input
          type="email"
          value={customerEmail}
          onChange={e => setCustomerEmail(e.target.value)}
          placeholder="client@example.com"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Description</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Website redesign"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ($)</label>
        <input
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="500"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>
      <button
        onClick={() => isValid && onNext({ customerName, customerPhone, customerEmail, description, amount, dueDate })}
        disabled={!isValid}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
      >
        Next
        <ArrowRightIcon />
      </button>
    </div>
  );
}

// ─── Step 3: Set Reminders ───────────────────────────────────────────────────
function SetRemindersStep({
  onNext,
}: {
  onNext: (reminders: { threeDaysBefore: boolean; onDueDate: boolean; threeDaysAfter: boolean }) => void;
}) {
  const [threeDaysBefore, setThreeDaysBefore] = useState(true);
  const [onDueDate, setOnDueDate] = useState(true);
  const [threeDaysAfter, setThreeDaysAfter] = useState(true);

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-orange-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Set your automatic reminders</h2>
        <p className="text-slate-400 text-sm">Remindrr will follow up so you don't have to.</p>
      </div>
      <div className="space-y-3">
        {[
          { label: '3 days before due date', checked: threeDaysBefore, onChange: setThreeDaysBefore },
          { label: 'On due date', checked: onDueDate, onChange: setOnDueDate },
          { label: '3 days after due date', checked: threeDaysAfter, onChange: setThreeDaysAfter },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3.5">
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
            <Toggle enabled={item.checked} onChange={item.onChange} />
          </div>
        ))}
      </div>
      <button
        onClick={() => onNext({ threeDaysBefore, onDueDate, threeDaysAfter })}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
      >
        Continue
        <ArrowRightIcon />
      </button>
    </div>
  );
}

// ─── Step 4: Preview Message ─────────────────────────────────────────────────
function PreviewStep({
  invoiceData,
  onNext,
}: {
  invoiceData: { customerName: string; customerPhone: string; customerEmail: string; description: string; amount: string; dueDate: string };
  onNext: () => void;
}) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Here's what your customer will receive</h2>
        <p className="text-slate-400 text-sm">Simple, friendly, and effective.</p>
      </div>
      {/* Message Preview */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">SMS Reminder</p>
            <p className="text-slate-800 text-sm leading-relaxed">
              Hi {invoiceData.customerName || 'Customer'} 👋 Your invoice of ${invoiceData.amount || '0'} for "
              {invoiceData.description || 'service'}" is due on {formatDate(invoiceData.dueDate)}. 📱 Send to: {invoiceData.customerPhone || 'no phone number'}
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        Send Invoice
        <ArrowRightIcon />
      </button>
    </div>
  );
}

// ─── Step 5: Success ──────────────────────────────────────────────────────────
function SuccessStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="text-center px-2">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Invoice Sent!</h1>
      <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">
        Reminders are active. You're now getting paid faster.
      </p>
      <div className="space-y-3">
        <button
          onClick={onFinish}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-orange-200"
        >
          View Dashboard
        </button>
        <button
          onClick={onFinish}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-3 rounded-xl transition-all"
        >
          Create Another Invoice
        </button>
      </div>
    </div>
  );
}

// ─── Main OnboardingFlow Component ──────────────────────────────────────────
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const settings = getSettings();

  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 5;

  const [setupData, setSetupData] = useState<{ ownerName: string; businessName: string; phone: string }>({
    ownerName: settings.ownerName || '',
    businessName: settings.businessName || '',
    phone: '',
  });

  const [invoiceData, setInvoiceData] = useState<{
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    description: string;
    amount: string;
    dueDate: string;
  } | null>(null);

  const [reminderData, setReminderData] = useState<{
    threeDaysBefore: boolean;
    onDueDate: boolean;
    threeDaysAfter: boolean;
  }>({ threeDaysBefore: true, onDueDate: true, threeDaysAfter: true });

  const finishOnboarding = () => {
    // Mark onboarding complete
    localStorage.setItem('remindrr_onboarding_complete', 'true');
    localStorage.setItem('remindrr_first_invoice_sent', new Date().toISOString());
    navigate('/');
  };

  const handleWelcomeNext = () => setStep(1);

  const handleSetupNext = (data: typeof setupData) => {
    setSetupData(data);
    // Save settings immediately
    const current = getSettings();
    saveSettings({ ...current, ownerName: data.ownerName, businessName: data.businessName });
    setStep(2);
  };

  const handleInvoiceNext = (data: typeof invoiceData extends null ? never : typeof invoiceData) => {
    setInvoiceData(data);
    setStep(3);
  };

  const handleRemindersNext = (data: typeof reminderData) => {
    setReminderData(data);
    setStep(4);
  };

  const handlePreviewNext = () => {
    // Actually create the invoice and client
    if (invoiceData) {
      const clientId = `client_${Date.now()}`;
      const newClient: Client = {
        id: clientId,
        name: invoiceData.customerName,
        email: '',
        phone: setupData.phone,
        createdAt: new Date().toISOString(),
      };
      saveClient(newClient);

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        clientId,
        clientName: invoiceData.customerName,
        clientPhone: invoiceData.customerPhone,
        clientEmail: invoiceData.customerEmail,
        description: invoiceData.description,
        amount: parseFloat(invoiceData.amount),
        status: 'pending',
        dueDate: invoiceData.dueDate,
        createdAt: new Date().toISOString(),
        reminderSent: false,
      };
      saveInvoice(newInvoice);
    }
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">R</div>
          <span className="text-lg font-bold text-slate-900">Remindrr</span>
        </div>
        {step > 0 && step < 5 && (
          <span className="text-sm text-slate-400 font-medium">
            {step} of {TOTAL_STEPS}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {step > 0 && step < 5 && <ProgressBar step={step - 1} total={TOTAL_STEPS} />}

          {step === 0 && <WelcomeStep onNext={handleWelcomeNext} />}

          {step === 1 && (
            <QuickSetupStep
              onNext={handleSetupNext}
              initialData={{ ownerName: setupData.ownerName, businessName: setupData.businessName, email: settings.email || '' }}
            />
          )}

          {step === 2 && <CreateInvoiceStep onNext={handleInvoiceNext} />}

          {step === 3 && <SetRemindersStep onNext={handleRemindersNext} />}

          {step === 4 && invoiceData && <PreviewStep invoiceData={invoiceData} onNext={handlePreviewNext} />}

          {step === 5 && <SuccessStep onFinish={finishOnboarding} />}
        </div>
      </div>

      {/* Skip */}
      {step < 5 && (
        <div className="text-center pb-8">
          <button
            onClick={finishOnboarding}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip setup — I'll do this later
          </button>
        </div>
      )}
    </div>
  );
}
