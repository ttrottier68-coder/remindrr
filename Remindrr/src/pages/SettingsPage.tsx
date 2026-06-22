import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings } from '../lib/store';
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
              Stripe is how you accept payments online. When your customer taps the payment link in the email, they pay through Stripe. Money goes directly into your bank account—usually in 2 business days.
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

// ─── Email Setup Guide ────────────────────────────────────────────────────
function EmailGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-green-200 rounded-xl overflow-hidden bg-green-50/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">EMAIL</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">How to set up Email Reminders</p>
            <p className="text-slate-500 text-xs mt-0.5">Resend (recommended) or SendGrid</p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-green-200 pt-4 space-y-4 text-sm text-slate-700">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="font-bold text-slate-800 mb-2">📧 Recommended: Resend</p>
            <p className="text-slate-600 leading-relaxed mb-3">
              Resend gives you 3,000 free emails/month - more than enough for most small businesses. No credit card required.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li>Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">resend.com</a> and sign up</li>
              <li>Add your domain (or use their test domain)</li>
              <li>Go to API Keys → Create API Key</li>
              <li>Copy the key (starts with <code className="bg-slate-100 px-1 rounded">re_</code>)</li>
            </ol>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="font-bold text-slate-800 mb-2">📧 Alternative: SendGrid</p>
            <p className="text-slate-600 leading-relaxed mb-2">
              SendGrid has a free tier but is ending free plans June 7th. We recommend Resend instead.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 text-xs">
              <li>Go to sendgrid.com and sign up</li>
              <li>Verify your sender identity</li>
              <li>Create API Key in Settings → API Keys</li>
            </ul>
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
    // Also save Resend key separately (persists on logout)
    if (form.sendgridApiKey) {
      localStorage.setItem('remindrr_sendgrid', JSON.stringify({
        apiKey: form.sendgridApiKey,
        fromEmail: form.sendgridFromEmail,
      }));
    }
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
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 1234"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
          </div>
        </div>
      </div>

      {/* ── Payment Status ── */}
      {form.stripeAccountId && (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-700 text-base border-b border-slate-100 pb-3 mb-4">⚡ Connection Status</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge label="Stripe" connected={!!form.stripeAccountId} fields={[form.stripeAccountId]} />
        </div>
      </div>
      )}

      {/* ── Stripe Setup ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">💳</div>
          <div>
            <h2 className="font-bold text-slate-700 text-base">Stripe Payment Setup</h2>
            <p className="text-slate-400 text-xs mt-0.5">Accept payments when customers tap the link in email</p>
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

      {/* ── Email (Resend) ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">📧</div>
          <div>
            <h2 className="font-bold text-slate-700 text-base">Email Reminders</h2>
            <p className="text-slate-400 text-xs mt-0.5">Resend - 3,000 free emails/month</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-3">
          <p className="font-semibold text-slate-700 text-sm">How to set up Resend:</p>
          <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
            <li>Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-green-600 underline font-medium">resend.com</a> and sign up</li>
            <li>Copy your API Key (starts with <code className="bg-slate-100 px-1 rounded text-xs">re_</code>) from <strong>API Keys</strong> page</li>
            <li>Paste it in the API Key field below</li>
            <li>Enter your sender email (e.g. yourname@onresend.com)</li>
          </ol>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Resend API Key</label>
            <input type="password" value={form.sendgridApiKey} onChange={e => set('sendgridApiKey', e.target.value)} placeholder="re_..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" />
            <p className="text-xs text-slate-400 mt-1">Found at: resend.com → API Keys</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Sender Email (From address)</label>
            <input type="email" value={form.sendgridFromEmail} onChange={e => set('sendgridFromEmail', e.target.value)} placeholder="yourname@onresend.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" />
            <p className="text-xs text-slate-400 mt-1">Your Resend sender email</p>
          </div>
        </div>
      </div>

      {/* ── Payment Methods ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">💳</div>
          <div>
            <h2 className="font-bold text-slate-700 text-base">Payment Methods</h2>
            <p className="text-slate-400 text-xs mt-0.5">Add your payment info so clients can pay you easily</p>
          </div>
        </div>

        {/* ── PayPal ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg">PayPal</div>
            <h3 className="font-bold text-slate-700 text-sm">PayPal.me (Recommended)</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            The easiest way for clients to pay you via PayPal. They just tap your link, review the amount, and pay — no app install needed.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-blue-700 mb-2">Step-by-step setup:</p>
            <ol className="text-xs text-slate-600 space-y-1.5">
              <li><span className="font-bold text-blue-700">1.</span> Go to <a href="https://www.paypal.com/paypalme" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">paypal.com/paypalme</a> and sign in to your PayPal account</li>
              <li><span className="font-bold text-blue-700">2.</span> Create your PayPal.me link (e.g., paypal.me/JohnSmith)</li>
              <li><span className="font-bold text-blue-700">3.</span> Copy the full link they give you</li>
              <li><span className="font-bold text-blue-700">4.</span> Paste it into the field below</li>
            </ol>
          </div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Your PayPal.me Link</label>
          <input type="text" value={form.paypalMe} onChange={e => set('paypalMe', e.target.value)} placeholder="https://paypal.me/yourname"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
          {form.paypalMe && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">✅ Looks good! This will show in your invoice emails.</p>
          )}
          {!form.paypalMe && (
            <p className="text-xs text-slate-400 mt-1.5">Leave blank if you don't use PayPal.</p>
          )}
        </div>

        <div className="border-t border-slate-100 mb-6" />

        {/* ── Venmo ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-lg">Venmo</div>
            <h3 className="font-bold text-slate-700 text-sm">Venmo @username</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Clients can find you in the Venmo app by searching your username. Works great for clients who already use Venmo.
          </p>
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-sky-700 mb-2">Step-by-step setup:</p>
            <ol className="text-xs text-slate-600 space-y-1.5">
              <li><span className="font-bold text-sky-700">1.</span> Open the Venmo app on your phone</li>
              <li><span className="font-bold text-sky-700">2.</span> Tap your profile picture (top-left)</li>
              <li><span className="font-bold text-sky-700">3.</span> Your @username is shown at the top (e.g., @John-Smith)</li>
              <li><span className="font-bold text-sky-700">4.</span> Enter that username below — <strong>include the @ symbol</strong></li>
            </ol>
          </div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Your Venmo Username</label>
          <input type="text" value={form.venmoUsername} onChange={e => set('venmoUsername', e.target.value)} placeholder="@yourusername"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all" />
          {form.venmoUsername && !form.venmoUsername.startsWith('@') && (
            <p className="text-xs text-amber-600 mt-1.5">Don't forget the @ symbol (e.g., @JohnSmith)</p>
          )}
          {form.venmoUsername && form.venmoUsername.startsWith('@') && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">✅ Looks good! This will show in your invoice emails.</p>
          )}
          {!form.venmoUsername && (
            <p className="text-xs text-slate-400 mt-1.5">Leave blank if you don't use Venmo.</p>
          )}
        </div>

        <div className="border-t border-slate-100 mb-6" />

        {/* ── Zelle ── */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-800 text-white text-xs font-bold px-3 py-1 rounded-lg">Zelle</div>
            <h3 className="font-bold text-slate-700 text-sm">Zelle</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Direct bank transfer. Clients pay from their bank app — no fees for either party. Most major US banks support it. <strong>US bank accounts only.</strong>
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-purple-700 mb-2">Step-by-step setup:</p>
            <ol className="text-xs text-slate-600 space-y-1.5">
              <li><span className="font-bold text-purple-700">1.</span> Zelle is linked to your bank — check your bank's app or website</li>
              <li><span className="font-bold text-purple-700">2.</span> Find the email address or phone number registered with Zelle</li>
              <li><span className="font-bold text-purple-700">3.</span> Enter that email or phone number below (clients send money to this)</li>
            </ol>
            <div className="mt-2 bg-purple-100 rounded-lg p-2 text-xs text-purple-800">
              💡 <strong>Tip:</strong> Your Zelle email/phone should match the bank account you want to receive money in.
            </div>
          </div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Your Zelle Email or Phone</label>
          <input type="text" value={form.zelleInfo} onChange={e => set('zelleInfo', e.target.value)} placeholder="your@email.com or 555-123-4567"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all" />
          {form.zelleInfo && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">✅ Looks good! This will show in your invoice emails.</p>
          )}
          {!form.zelleInfo && (
            <p className="text-xs text-slate-400 mt-1.5">Leave blank if you don't use Zelle.</p>
          )}
        </div>
      </div>

      {/* ── Plan ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-700 text-base border-b border-slate-100 pb-3 mb-4">📋 Plan</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 p-4 rounded-xl border-2 border-orange-500 bg-orange-50 text-center">
            <div className="text-base font-bold text-slate-800">Starter</div>
            <div className="text-xs text-slate-500 mt-1">$29/mo</div>
            <div className="mt-2 text-xs text-green-600 font-medium">✓ Current plan</div>
          </div>
          <div className="flex-1 p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <div className="text-sm font-bold text-slate-400">Contact us</div>
            <div className="text-xs text-slate-400 mt-1">for custom plans</div>
            <div className="mt-2 text-xs text-slate-400">support@remindrr.app</div>
          </div>
        </div>
      </div>
    </div>
  );
}
