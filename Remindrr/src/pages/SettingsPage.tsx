import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings } from '../lib/reminder-data';
import type { UserSettings } from '../types';

const BackIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const SaveIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const AlertIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ChevronIcon = ({ open }: { open: boolean }) => <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;

// ─── Stripe Setup Guide ───────────────────────────────────────────────────────
function StripeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden bg-blue-50/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">STRIPE</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">How to set up Stripe (step by step)</p>
            <p className="text-slate-500 text-xs mt-0.5">Takes about 5 minutes · Free account</p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-blue-200 pt-4 space-y-4 text-sm text-slate-700">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="font-bold text-slate-800 mb-2">💳 What is Stripe?</p>
            <p className="text-slate-600 leading-relaxed">
              Stripe is how you accept payments online. When your customer taps the payment link in the SMS, they pay through Stripe. Money goes directly into your bank account—usually in 2 business days.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-semibold text-slate-800">Go to stripe.com and click "Start now"</p>
                <p className="text-slate-500 text-xs mt-1">Use your email and create a password. It&apos;s free to sign up.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-semibold text-slate-800">Enter your business details</p>
                <p className="text-slate-500 text-xs mt-1">Name, address, bank info (for payouts). Stripe is secure and trusted by millions of businesses.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-semibold text-slate-800">Verify your email address</p>
                <p className="text-slate-500 text-xs mt-1">Stripe will send you an email—click the link inside to confirm your account.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
              <div>
                <p className="font-semibold text-slate-800">Copy your Stripe Account ID</p>
                <p className="text-slate-500 text-xs mt-1">Log into stripe.com → look at the top-left corner next to your business name. It looks like: <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">acct_1A2B3C4D5E6F</span> — copy that whole thing.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
              <div>
                <p className="font-semibold text-slate-800">Paste it into the field on this page and click Save</p>
                <p className="text-slate-500 text-xs mt-1">That&apos;s it! Your account is connected. You&apos;ll get an email from Stripe when your first payout is ready.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <span className="font-semibold">Note:</span> Stripe has a 2-day payout delay for new accounts—this is normal and improves as you build history with them.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Twilio Setup Guide ──────────────────────────────────────────────────────
function TwilioGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-purple-200 rounded-xl overflow-hidden bg-purple-50/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-purple-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">TWILIO</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">How to set up Twilio (step by step)</p>
            <p className="text-slate-500 text-xs mt-0.5">Takes about 5 minutes · $1/month for a phone number</p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-purple-200 pt-4 space-y-4 text-sm text-slate-700">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="font-bold text-slate-800 mb-2">📱 What is Twilio?</p>
            <p className="text-slate-600 leading-relaxed">
              Twilio is the service that sends the SMS text messages to your customers. You&apos;ll buy a phone number from them for $1/month—the same number shows in the &quot;From&quot; field on all your reminders.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-semibold text-slate-800">Go to twilio.com and click "Sign up"</p>
                <p className="text-slate-500 text-xs mt-1">Use your email and create a password. Use your real name—it&apos;ll appear on the SMS if you verify it.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-semibold text-slate-800">Verify your email address</p>
                <p className="text-slate-500 text-xs mt-1">Twilio will email you a verification link—click it before you can continue.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-semibold text-slate-800">Buy an SMS phone number ($1/month)</p>
                <p className="text-slate-500 text-xs mt-1">After you log in, go to <strong>Phone Numbers → Buy a number</strong>. Pick any US/Canadian number—local or toll-free. It costs about $1/month.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
              <div>
                <p className="font-semibold text-slate-800">Copy your Account SID and Auth Token</p>
                <p className="text-slate-500 text-xs mt-1">Go to the Twilio Console (your account dashboard). You&apos;ll see your <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">Account SID</span> (starts with <span className="font-mono">AC</span>) and <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">Auth Token</span>. Copy both into the fields on this page.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
              <div>
                <p className="font-semibold text-slate-800">Copy your Twilio phone number</p>
                <p className="text-slate-500 text-xs mt-1">In the same Console, find your purchased number (it looks like <span className="font-mono">+1 555 000 1234</span>). Paste it into the &quot;Twilio Phone Number&quot; field on this page.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
              <div>
                <p className="font-semibold text-slate-800">Click Save on this page</p>
                <p className="text-slate-500 text-xs mt-1">That&apos;s it! Remindrr will now send SMS reminders from your Twilio number. Test it by creating an invoice and sending a reminder.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <span className="font-semibold">Important:</span> Twilio requires you to verify your phone number before sending SMS. They may temporarily pause your account if you send to too many numbers too fast—this is normal and resolves in a few hours. Keep SMS volume reasonable.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SendGrid Setup Guide ────────────────────────────────────────────────────
function SendGridGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-green-200 rounded-xl overflow-hidden bg-green-50/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">SENDGRID</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">How to set up SendGrid (step by step)</p>
            <p className="text-slate-500 text-xs mt-0.5">Takes about 5 minutes · Free tier (100 emails/day)</p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-green-200 pt-4 space-y-4 text-sm text-slate-700">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="font-bold text-slate-800 mb-2">📧 What is SendGrid?</p>
            <p className="text-slate-600 leading-relaxed">
              SendGrid sends email reminders to your customers when their invoices are due. It's the email equivalent of Twilio — reliable, professional, and won't go to spam when set up correctly.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-semibold text-slate-800">Sign up at sendgrid.com</p>
                <p className="text-slate-500 text-xs mt-1">Use the same email you use for Remindrr. Free tier is fine to start.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-semibold text-slate-800">Verify your sender email</p>
                <p className="text-slate-500 text-xs mt-1">Check your inbox for an email from SendGrid and click the verification link.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-semibold text-slate-800">Create an API Key</p>
                <p className="text-slate-500 text-xs mt-1">Go to <strong>Settings → API Keys → Create API Key → Full Access → Create & Copy</strong>. Paste it into the field on the left.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <div>
                <p className="font-semibold text-slate-800">Add your sender email</p>
                <p className="text-slate-500 text-xs mt-1">Enter the email you verified with (e.g. ttrottier68@gmail.com). This is who the emails appear to come from.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Connection Status Badge ──────────────────────────────────────────────────
function StatusBadge({ label, connected, fields }: { label: string; connected: boolean; fields: string[] }) {
  const hasValue = fields.some(f => typeof f === 'string' && f.trim().length > 0);
  const isActive = connected && hasValue;
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
      {isActive
        ? <><span className="text-green-500"><CheckIcon /></span> {label} connected</>
        : <><span className="text-amber-500"><AlertIcon /></span> {label} not configured</>
      }
    </div>
  );
}

// ─── Account Debug ───────────────────────────────────────────────────────────
function AccountDebug() {
  const [show, setShow] = useState(false);
  const email = localStorage.getItem('remindrr_user_email') || '';
  const storedPw = email ? localStorage.getItem(`remindrr账号${email}`) : '';
  const isDemo = email === 'demo@demo.com';
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🔧</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Account Debug</p>
            <p className="text-slate-500 text-xs">Troubleshoot login issues</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{show ? 'Hide' : 'Show'}</span>
      </button>
      {show && (
        <div className="px-4 pb-4 border-t border-amber-200 pt-3 space-y-2 text-xs">
          <div className="bg-white rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-500">Logged in as:</span><span className="font-mono text-slate-700">{email || '(none)'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Stored password:</span><span className="font-mono text-slate-700">{storedPw ? '✅ stored' : '❌ missing'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Demo account:</span><span className="font-mono text-slate-700">{isDemo ? '✅ yes' : '❌ no'}</span></div>
          </div>
          {!email && (
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-amber-800">
              <p className="font-semibold mb-1">No account found.</p>
              <p>Go to <strong>/signup</strong> and register with your email to create an account.</p>
            </div>
          )}
          {email && !isDemo && storedPw && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800">
              <p className="font-semibold mb-1">✅ Account looks correct!</p>
              <p>Try logging out and back in with email: <strong>{email}</strong></p>
            </div>
          )}
          {email && !storedPw && !isDemo && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">
              <p className="font-semibold mb-1">⚠️ No password found for this account.</p>
              <p>Clear browser data or use the same browser you registered with.</p>
            </div>
          )}
          <button
            onClick={() => { localStorage.removeItem('remindrr_session'); localStorage.removeItem('remindrr_user_email'); window.location.href = '/login'; }}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors text-xs"
          >
            Sign Out & Clear Session
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  const existing = getSettings();
  const [form, setForm] = useState<UserSettings>(existing || {
    businessName: '', ownerName: '', email: '', phone: '',
    stripeAccountId: 'acct_1SjQQ7Jo506UIVlZ', twilioSid: '', twilioToken: '', twilioPhone: '',
    sendgridApiKey: '',
    plan: 'starter',
  });
  const [saved, setSaved] = useState(false);

  const set = (k: keyof UserSettings, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <BackIcon />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-shadow text-sm"
        >
          <SaveIcon />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* ── Account Debug ── */}
      <AccountDebug />

      {/* ── Business Info ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-700 text-base border-b border-slate-100 pb-3 mb-4">🏢 Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Your Name</label>
            <input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Mike Thompson"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Business Name</label>
            <input value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Mike's Plumbing"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="mike@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone Number (for SMS sender ID)</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 1234"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
          </div>
        </div>
      </div>

      {/* ── Payment & SMS Status ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-700 text-base border-b border-slate-100 pb-3 mb-4">⚡ Connection Status</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge label="Stripe" connected={!!form.stripeAccountId} fields={[form.stripeAccountId]} />
          <StatusBadge label="Twilio SMS" connected={!!(form.twilioSid && form.twilioToken && form.twilioPhone)} fields={[form.twilioSid, form.twilioToken, form.twilioPhone]} />
        </div>
        <p className="text-xs text-slate-400 mt-3">Configure both below to enable automated payment collection and SMS reminders.</p>
      </div>

      {/* ── Stripe Setup ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">💳</div>
          <div>
            <h2 className="font-bold text-slate-700 text-base">Stripe Payment Setup</h2>
            <p className="text-slate-400 text-xs mt-0.5">Accept payments when customers tap the link in their SMS</p>
          </div>
        </div>
        <StripeGuide />
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Stripe Account ID</label>
            <input value={form.stripeAccountId} onChange={e => set('stripeAccountId', e.target.value)} placeholder="acct_1A2B3C4D5E6F"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
            <strong>Where to find your Stripe Account ID:</strong> Log into <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="underline font-semibold">dashboard.stripe.com</a> — your Account ID is at the top left, next to your business name. It starts with <span className="font-mono bg-blue-100 px-1 rounded">acct_</span>
          </div>
        </div>
      </div>

      {/* ── Twilio SMS Setup ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">📱</div>
          <div>
            <h2 className="font-bold text-slate-700 text-base">Twilio SMS Setup</h2>
            <p className="text-slate-400 text-xs mt-0.5">Send automatic payment reminder texts to your customers</p>
          </div>
        </div>
        <TwilioGuide />
        <SendGridGuide />
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Twilio Account SID</label>
            <input value={form.twilioSid} onChange={e => set('twilioSid', e.target.value)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Twilio Auth Token</label>
            <input type="password" value={form.twilioToken} onChange={e => set('twilioToken', e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Twilio Phone Number (with +1)</label>
            <input value={form.twilioPhone} onChange={e => set('twilioPhone', e.target.value)} placeholder="+15550001234"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all" />
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-xs text-purple-700 leading-relaxed">
            <strong>Where to find these:</strong> Log into <a href="https://console.twilio.com" target="_blank" rel="noreferrer" className="underline font-semibold">console.twilio.com</a>. Your SID and Auth Token are on the main dashboard. Your phone number is under <strong>Phone Numbers → Manage → Active Numbers</strong>.
          </div>
        </div>
      </div>

      {/* ── SendGrid ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-700 text-base border-b border-slate-100 pb-3 mb-4">📧 SendGrid Email Setup</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">SendGrid API Key</label>
            <input type="password" value={form.sendgridApiKey} onChange={e => set('sendgridApiKey', e.target.value)} placeholder="SG.your_sendgrid_api_key"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" />
            <p className="text-xs text-slate-400 mt-1">Found at: Settings → API Keys → Create API Key → Full Access</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Sender Email (From address)</label>
            <input type="email" value={form.sendgridFromEmail} onChange={e => set('sendgridFromEmail', e.target.value)} placeholder="your@email.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" />
            <p className="text-xs text-slate-400 mt-1">Must be verified in SendGrid → Sender Authentication</p>
          </div>
        </div>
      </div>

      {/* ── Plan ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-700 text-base border-b border-slate-100 pb-3 mb-4">📋 Plan</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['starter', 'pro', 'business'] as const).map(plan => {
            const links: Record<string, string> = {
              starter: 'https://buy.stripe.com/4gM9AU3nIaoE26YdS21wY01',
              pro: 'https://buy.stripe.com/fZu8wQe2mcwMfXOaFQ1wY02',
              business: 'https://buy.stripe.com/8x28wQ0bw0O46neg0a1wY03',
            };
            return (
              <button
                key={plan}
                onClick={() => {
                  setForm(f => ({ ...f, plan }));
                  window.open(links[plan], '_blank');
                }}
                className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${form.plan === plan ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="text-base font-bold text-slate-800 capitalize">{plan}</div>
                <div className="text-xs text-slate-400 mt-1">{plan === 'starter' ? '$29/mo' : plan === 'pro' ? '$59/mo' : '$129/mo'}</div>
                {form.plan !== plan && <div className="text-xs text-orange-500 mt-1 font-medium">Upgrade →</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
