import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getSettings, saveSettings, getDashboardStats, getInvoices, getClients, saveInvoice, saveClient, markInvoicePaid, deleteInvoice, sendReminderNow, openMailto, loadFromCloud, syncToCloud, checkAndFireAutoReminders, printInvoice } from './lib/reminder-data';
import { showToast } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';
import { isAuthenticated, logout, ensureDemoAccount } from './lib/auth';
import type { Invoice, Client } from './types';
import { getTrialDaysLeft } from './types';
import SettingsPage from './pages/SettingsPage';
import AddClientPage from './pages/AddClientPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LandingPage from './pages/LandingPage';
import OnboardingFlow from './pages/OnboardingFlow';
import EditInvoicePage from './pages/EditInvoicePage';
import ResetPage from './pages/ResetPage';
import PlansPage from './pages/PlansPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// ─── Icons ──────────────────────────────────────────────────────────────────
const PlusIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const DollarIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
const FileIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CogIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ArrowLeftIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const LogoutIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

// ─── Helpers ────────────────────────────────────────────────────────────────
function daysUntilDue(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(inv: Invoice) {
  if (inv.status === 'paid') return { label: 'PAID', color: 'bg-green-100 text-green-700' };
  const days = daysUntilDue(inv.dueDate);
  if (days < 0) return { label: 'OVERDUE', color: 'bg-red-100 text-red-700' };
  if (days <= 3) return { label: 'DUE SOON', color: 'bg-amber-100 text-amber-700' };
  return { label: 'PENDING', color: 'bg-slate-100 text-slate-600' };
}

// State/Province tax rates data
const stateRates: Record<string, number> = {
  'AL': 9.0, 'AK': 0, 'AZ': 8.25, 'AR': 9.0, 'CA': 8.68, 'CO': 7.0, 'CT': 6.35, 'DE': 0,
  'FL': 6.5, 'GA': 7.0, 'HI': 4.0, 'ID': 6.0, 'IL': 8.25, 'IN': 7.0, 'IA': 6.0, 'KS': 8.0,
  'KY': 6.0, 'LA': 9.0, 'ME': 5.5, 'MD': 6.0, 'MA': 6.25, 'MI': 6.0, 'MN': 6.875, 'MS': 7.0,
  'MO': 8.0, 'MT': 0, 'NE': 6.5, 'NV': 6.85, 'NH': 0, 'NJ': 6.625, 'NM': 7.0, 'NY': 8.0,
  'NC': 6.0, 'ND': 6.5, 'OH': 7.0, 'OK': 8.0, 'OR': 0, 'PA': 6.0, 'RI': 7.0, 'SC': 7.0,
  'SD': 5.5, 'TN': 7.0, 'TX': 6.25, 'UT': 6.85, 'VT': 6.0, 'VA': 5.75, 'WA': 6.5, 'WV': 6.5,
  'WI': 5.5, 'WY': 4.0,
  'CA-BC': 12, 'CA-ON': 13, 'CA-QC': 14.975, 'CA-AB': 5, 'CA-MB': 12, 'CA-SK': 11, 'CA-NS': 15,
  'CA-NB': 15, 'CA-PE': 15, 'CA-NL': 15, 'CA-NT': 5, 'CA-YU': 5, 'CA-NU': 5
};

const stateLabels: Record<string, string> = {
  'CA-BC': 'BC PST', 'CA-ON': 'HST', 'CA-QC': 'QST', 'CA-AB': 'GST', 'CA-MB': 'Manitoba PST',
  'CA-SK': 'Sask PST', 'CA-NS': 'HST', 'CA-NB': 'HST', 'CA-PE': 'HST', 'CA-NL': 'HST',
  'CA-NT': 'GST', 'CA-YU': 'GST', 'CA-NU': 'GST'
};


// Format a date string (YYYY-MM-DD) to "Jan 15, 2024"
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
// ─── NavBar ────────────────────────────────────────────────────────────────
function NavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    try { localStorage.removeItem('remindrr_onboarding_complete'); } catch {}
    window.location.replace('/login');
  };
  const navItems = [
    { label: 'Dashboard', to: '/', icon: <DollarIcon /> },
    { label: 'Invoices', to: '/invoices', icon: <FileIcon /> },
    { label: 'Clients', to: '/clients', icon: <UsersIcon /> },
    { label: 'Settings', to: '/settings', icon: <CogIcon /> },
  ];
  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-90">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-sm font-bold shadow">R</div>
            <span className="text-xl font-bold tracking-tight">Remindrr</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button key={item.to} onClick={() => navigate(item.to)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors">
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors text-slate-400 hover:text-white ml-2"
            >
              <LogoutIcon /><span>Logout</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              title="Sign out"
              className="hidden md:flex items-center gap-1.5 px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
            >
              <LogoutIcon />
            </button>
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {navItems.map(item => (
              <button key={item.to} onClick={() => { navigate(item.to); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-slate-800">
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800">
              <LogoutIcon /><span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Setup Page ─────────────────────────────────────────────────────────────
function SetupPage() {
  const [s, setS] = useState({ ownerName: '', businessName: '', phone: '', email: '', plan: 'starter' as const });
  const [step, setStep] = useState(1);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const set = (k: string, v: string) => setS(ss => ({ ...ss, [k]: v }));

  // Plan payment links
  const paymentLinks: Record<string, string> = {
    starter: 'https://buy.stripe.com/4gM9AU3nIaoE26YdS21wY01',
    pro: 'https://buy.stripe.com/fZu8wQe2mcwMfXOaFQ1wY02',
    business: 'https://buy.stripe.com/8x28wQ0bw0O46neg0a1wY03'
  };

  const handlePlanSelect = (plan: string) => {
    setS(ss => ({ ...ss, plan: plan as typeof ss.plan }));
  };

  const handlePayment = () => {
    // Open Stripe payment in new tab
    window.open(paymentLinks[s.plan], '_blank');
    // Show confirmation message
    setPaymentComplete(true);
  };

  const submit = () => {
    if (!paymentComplete) {
      alert('Please complete payment first by clicking the button above and verifying your subscription.');
      return;
    }
    saveSettings(s as any); window.location.reload();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg">R</div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Remindrr</h1>
          <p className="text-slate-500 mt-2">Stop chasing payments. Get paid on time, every time.</p>
        </div>
        {step === 1 && (
          <div className="space-y-4">
            {[['ownerName','Your Name','Mike Thompson'],['businessName','Business Name',"Mike's Plumbing"],['phone','Phone (for SMS)','+1 555 000 1234'],['email','Email','mike@example.com']].map(([k,l,p]) => (
              <div key={k}><label className="block text-sm font-medium text-slate-700 mb-1">{l}</label>
                <input value={s[k as keyof typeof s]} onChange={e => set(k, e.target.value)} placeholder={p}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            ))}
            <button onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 mt-2">
              Next: Choose Plan →
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-slate-600 text-sm mb-3">Choose your plan.</p>
            {[['starter','Starter','$29.99/mo','50 clients · 200 SMS'],['pro','Pro','$59.99/mo','Unlimited clients & SMS'],['business','Business','$129/mo','Multi-user + API']].map(([id,label,price,desc]) => (
              <div key={id} onClick={() => setS(ss => ({ ...ss, plan: id as typeof ss.plan }))}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${s.plan === id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div><p className="font-bold text-slate-800">{label}</p><p className="text-sm text-slate-500">{desc}</p></div>
                  <p className="font-bold text-orange-500">{price}</p>
                </div>
              </div>
            ))}
            {/* Payment Section */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">💳 Subscribe to use Remindrr</p>
              <button onClick={handlePayment}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg mb-3">
                Pay {s.plan === 'starter' ? '$29.99/mo' : s.plan === 'pro' ? '$59.99/mo' : '$129/mo'} with Stripe →
              </button>
              {paymentComplete && (
                <label className="flex items-center gap-2 text-sm text-green-600">
                  <input type="checkbox" checked readOnly className="w-4 h-4" />
                  I've completed my payment
                </label>
              )}
              <p className="text-xs text-slate-400 mt-2">Click above to pay via Stripe, then check the box to confirm.</p>
            </div>
            <button onClick={submit}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!paymentComplete}>
              Get Started →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Trial Banner ─────────────────────────────────────────────────────────────
function TrialBanner() {
  const settings = getSettings();
  const [dismissed, setDismissed] = useState(false);
  const daysLeft = getTrialDaysLeft(settings);

  if (dismissed) return null;

  // Expired trial — redirect to plans page
  if (settings?.plan === 'trial' && daysLeft === 0) {
    if (window.location.pathname !== '/plans') {
      window.location.href = '/plans';
      return null;
    }
    return null;
  }

  // Active trial — show banner
  if (settings?.plan === 'trial' && daysLeft > 0) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white flex items-center justify-between gap-4 shadow-lg shadow-orange-200/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-bold text-sm">Free trial active — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left</p>
            <p className="text-orange-100 text-xs">Enjoy full access. Upgrade anytime to keep it after your trial ends.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => window.location.href = '/plans'}
            className="bg-white text-orange-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            Upgrade → $29/mo
          </button>
          <button onClick={() => setDismissed(true)} className="text-orange-200 hover:text-white text-xs px-2 py-2">✕</button>
        </div>
      </div>
    );
  }

  // Paid user — no banner
  return null;
}

// ─── Upgrade Banner ────────────────────────────────────────────────────────────────
function UpgradeBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  // Only show for paid users (trial users see TrialBanner instead)
  const settings = getSettings();
  if (settings?.plan === 'trial') return null;
  const count = getInvoices().length;
  if (count < 5) return null;
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white flex items-center justify-between gap-4 shadow-lg shadow-orange-200/50">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚀</span>
        <div>
          <p className="font-bold text-sm">
            Love Remindrr? Help us grow and get perks.
          </p>
          <p className="text-orange-100 text-xs">
            Refer a friend and both get one free month.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => window.location.href = '/plans'}
          className="bg-white text-orange-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
        >
          Refer a friend
        </button>
        <button onClick={() => setDismissed(true)} className="text-orange-200 hover:text-white text-xs px-2 py-2">✕</button>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const settings = getSettings();
  const stats = getDashboardStats();
  const all = getInvoices();
  const clients = getClients();
  
  // Revenue metrics
  const collected = stats.paidThisMonth;
  const outstanding = stats.totalOutstanding;
  const overdueAmount = all.filter(i => i.status !== 'paid' && daysUntilDue(i.dueDate) < 0).reduce((s, i) => s + i.amount, 0);
  
  // Recent invoices
  const recent = getInvoices().slice(-8).reverse();
  
  // Quick actions needed
  const overdueInvoices = all.filter(i => i.status !== 'paid' && daysUntilDue(i.dueDate) < 0);
  const dueSoonInvoices = all.filter(i => i.status !== 'paid' && daysUntilDue(i.dueDate) >= 0 && daysUntilDue(i.dueDate) <= 3);
  
  // Top overdue clients
  const overdueByClient: Record<string, number> = {};
  overdueInvoices.forEach(inv => {
    const key = inv.clientName || 'Unknown';
    overdueByClient[key] = (overdueByClient[key] || 0) + inv.amount;
  });
  const topOverdue = Object.entries(overdueByClient).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const cards = [
    { label: 'Collected', value: '$' + collected.toFixed(0), sub: 'this month', icon: <DollarIcon />, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
    { label: 'Outstanding', value: '$' + outstanding.toFixed(0), sub: 'total owed', icon: <ClockIcon />, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue', value: String(stats.overdue), sub: 'invoice' + (stats.overdue !== 1 ? 's' : '') + ' past due', icon: <AlertIcon />, color: 'from-red-500 to-red-600', bg: 'bg-red-50' },
    { label: 'Clients', value: String(clients.length), sub: 'active', icon: <UsersIcon />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {settings?.businessName ? settings.businessName + ' Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm">{clients.length} clients · {all.filter(i => i.status !== 'paid').length} active invoices</p>
        </div>
        <button onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30">
          <PlusIcon /> New Invoice
        </button>
      </div>

      <UpgradeBanner />
      <TrialBanner />
      
      {/* Complete Setup CTA */}
      {(!settings?.businessName || !settings?.phone) && (
      <a href="/onboarding" className="block bg-orange-50 border border-orange-200 rounded-xl p-5">
          <h3 className="font-bold text-orange-800 mb-1">Complete your setup</h3>
          <p className="text-sm text-orange-700 mb-3">Add your phone to start sending invoices.</p>
          <span className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">Complete Setup</span>
      </a>
      )}
      
      {/* Action alerts — overdue / due soon */}
      {(overdueInvoices.length > 0 || dueSoonInvoices.length > 0) && (
        <div className="space-y-2">
          {overdueInvoices.slice(0, 2).map(inv => (
            <div key={inv.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔴</span>
                <div>
                  <p className="text-sm font-bold text-red-800">{inv.clientName || 'Unknown client'}</p>
                  <p className="text-xs text-red-600">${inv.amount.toFixed(0)} overdue by {Math.abs(daysUntilDue(inv.dueDate))} day{Math.abs(daysUntilDue(inv.dueDate)) !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => navigate(`/invoices/${inv.id}/edit`)} className="text-xs bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-200">Send Reminder</button>
            </div>
          ))}
          {dueSoonInvoices.slice(0, 1).map(inv => (
            <div key={inv.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🟡</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">{inv.clientName || 'Unknown client'}</p>
                  <p className="text-xs text-amber-600">${inv.amount.toFixed(0)} due in {daysUntilDue(inv.dueDate)} day{daysUntilDue(inv.dueDate) !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => navigate(`/invoices/${inv.id}/edit`)} className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-200">Send Reminder</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">{c.label}</p>
              <div className={`${c.bg} p-2 rounded-lg`}><div className={`text-white`}>{c.icon}</div></div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-col layout: Recent Invoices + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Recent Invoices</h2>
            <button onClick={() => navigate('/invoices')} className="text-sm text-orange-500 font-medium hover:underline">View all →</button>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-slate-500 mb-3">No invoices yet</p>
              <button onClick={() => navigate('/invoices/new')} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-5 py-2 rounded-xl text-sm">Create your first →</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                const st = getStatus(inv);
                const days = daysUntilDue(inv.dueDate);
                return (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}/edit`)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${st.color.split(' ')[0] === 'bg-red-100' ? 'bg-red-500' : st.color.split(' ')[0] === 'bg-amber-100' ? 'bg-amber-500' : st.color.split(' ')[0] === 'bg-green-100' ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{client?.name || inv.clientName}</p>
                        <p className="text-xs text-slate-400">{inv.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">${inv.amount.toFixed(0)}</p>
                      <p className={`text-xs ${st.color.split(' ')[1]}`}>{st.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/invoices/new')} className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-sm font-medium text-orange-700 transition-colors">
                + New Invoice
              </button>
              <button onClick={() => navigate('/clients/new')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                + Add Client
              </button>
              <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                ⚙️ Email Settings
              </button>
              {overdueInvoices.length > 0 && (
                <button onClick={() => navigate('/invoices')} className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-bold text-red-700 transition-colors">
                  🔴 {overdueInvoices.length} Overdue Invoice{overdueInvoices.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
          
          {/* Payment Methods Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-3">💳 Payment Options</h3>
            <div className="space-y-2 text-sm">
              {settings?.paypalMe ? (
                <div className="flex items-center gap-2 text-green-600"><span>✓</span> PayPal configured</div>
              ) : (
                <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-amber-600"><span>⚠</span> Add PayPal/Venmo</button>
              )}
              {settings?.venmoUsername ? (
                <div className="flex items-center gap-2 text-green-600"><span>✓</span> Venmo @{settings.venmoUsername}</div>
              ) : null}
              {settings?.sendgridApiKey ? (
                <div className="flex items-center gap-2 text-green-600"><span>✓</span> Email reminders active</div>
              ) : (
                <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-red-600"><span>✕</span> Set up email reminders</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Card ────────────────────────────────────────────────────────────
// InvoiceCard is now in ./components/InvoiceCard.tsx — imported above

// ─── Invoices Page ──────────────────────────────────────────────────────────
function InvoicesPage() {
  const [filter, setFilter] = useState('all');
  const [tick, setTick] = useState(0);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const settings = getSettings();
  const handleSendReminder = (inv: Invoice) => {
    setSendingId(inv.id);
    setLastMessage('Processing...');
    sendReminderNow(inv).then(result => {
      setSendingId(null);
      setLastMessage(result.message);
      if (result.success) showToast('Email sent!', 'success');
      else showToast(result.message, 'error');
    }).catch(err => {
      setSendingId(null);
      showToast('Error: ' + err, 'error');
    });
  };
  // Refresh invoices when tick changes
  useEffect(() => {}, [tick]);
  const all = getInvoices().reverse();
  const filtered = all.filter(inv => {
    if (filter === 'paid') return inv.status === 'paid';
    if (filter === 'pending') return inv.status === 'pending' && daysUntilDue(inv.dueDate) >= 0;
    if (filter === 'overdue') return inv.status !== 'paid' && daysUntilDue(inv.dueDate) < 0;
    return true;
  });
  const counts = {
    all: all.length,
    pending: all.filter(i => i.status === 'pending' && daysUntilDue(i.dueDate) >= 0).length,
    overdue: all.filter(i => i.status !== 'paid' && daysUntilDue(i.dueDate) < 0).length,
    paid: all.filter(i => i.status === 'paid').length,
  };
  const tabs = ['all', 'pending', 'overdue', 'paid'] as const;
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
        <button onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30">
          <PlusIcon /> New Invoice
        </button>
      </div>
      {lastMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
          {lastMessage}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === t ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
          <p className="text-slate-400 text-lg">No {filter !== 'all' ? filter : ''} invoices</p>
          <button onClick={() => navigate('/invoices/new')} className="text-orange-500 font-bold mt-3 hover:underline">Create one →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => {
            const client = getClients().find(c => c.id === inv.clientId);
            const st = getStatus(inv);
            return (
              <div key={inv.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-lg">{client?.name || inv.clientName}</p>
                    <p className="text-sm text-slate-500">{inv.description || 'No description'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-xl">${inv.amount.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Due {formatDate(inv.dueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span>
                    {inv.status !== 'paid' && (
                      <>
                        <button type="button" onClick={() => openMailto(inv)}
                          className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg hover:bg-blue-100">
                          📧 Email
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); handleSendReminder(inv); }} disabled={sendingId === inv.id}
                          className="text-xs bg-orange-50 text-orange-700 font-bold px-3 py-1 rounded-lg hover:bg-orange-100 disabled:opacity-50">
                          {sendingId === inv.id ? 'Sending...' : 'Auto 🔔'}
                        </button>
                        <button
                          onClick={() => { markInvoicePaid(inv.id); setTick(t => t + 1); }}
                          className="text-xs bg-green-500 text-white font-bold px-3 py-1 rounded-lg hover:bg-green-600"
                        >
                          Mark Paid ✓
                        </button>
                        {inv.status !== 'paid' && !inv.paymentLink && (settings?.paypalMe || settings?.venmoUsername) && (
                          <a href={settings.paypalMe || `https://venmo.com/${(settings.venmoUsername || '').replace('@', '')}`} target="_blank" rel="noreferrer"
                            className="text-xs bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-lg hover:bg-purple-100">
                            💳 Pay
                          </a>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => printInvoice(inv)} className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-lg hover:bg-slate-200">
                      🖨️ Print
                    </button>
                    <button onClick={() => navigate(`/invoices/${inv.id}/edit`)} className="text-sm text-orange-500 font-medium hover:underline">
                      View →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── New Invoice Page ───────────────────────────────────────────────────────
function NewInvoicePage() {
  const navigate = useNavigate();
  const clients = getClients();
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [reminderMethod, setReminderMethod] = useState<'email'>('email');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [taxName, setTaxName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [useNew, setUseNew] = useState(false);
  const [preview, setPreview] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMessage, setEditMessage] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const subtotal = parseFloat(amount) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const selectedClient = clients.find(c => c.id === clientId);
  const finalEmail = useNew ? newEmail : (selectedClient?.email || '');
  const finalName = useNew ? newName : (selectedClient?.name || '');
  const invId = 'inv_' + Math.random().toString(36).slice(2, 11);
  // paymentLink intentionally left empty — let users configure PayPal/Venmo/Zelle in settings

  const defaultEmailSubject = finalEmail ? `Payment Reminder: Invoice for ${description || 'your service'}` : '';
  const defaultEmailBody = finalEmail
    ? `Hi ${finalName},\n\nJust a friendly reminder that your invoice of $${total.toFixed(2)} for "${description || 'your service'}"${taxRate > 0 ? ` (incl. ${taxName})` : ''} is due on ${formatDate(dueDate)}.\n\nYou can pay using PayPal, Venmo, or Zelle — details below.\n\nThanks for your business!`
    : '';

  const [messageText, setMessageText] = useState('');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');

// Populate preview text when preview screen first opens
  useEffect(() => {
    if (preview && finalEmail) {
      setEmailSubj(defaultEmailSubject);
      setMessageText(defaultEmailBody);
    }
  }, [preview, finalEmail]);
 useEffect(() => {
  if (done) navigate('/invoices');
}, [done]);
  
  const handleConfirm = async () => {
    
    setSaving(true);
    let finalClientId = clientId;
    let finalClientName = finalName;
    if (useNew && newName) {
      finalClientId = 'cl_' + Math.random().toString(36).slice(2, 11);
      saveClient({ id: finalClientId, name: newName, email: newEmail, createdAt: new Date().toISOString() });
      finalClientName = newName;
    }
    saveInvoice({
      id: invId, invoiceNumber: invoiceNumber || undefined, clientId: finalClientId, clientName: finalClientName,
      clientEmail: finalEmail,
      amount: total, taxRate, taxName, subtotal,
      description, dueDate, status: 'pending',
      paymentLink: '', createdAt: new Date().toISOString(),
    });
    // Sync to server (no await - runs in background)
    
    setSaving(false);
    setDone(true);
    await new Promise(r => setTimeout(r, 800));
    navigate('/invoices');
  };

  if (done) return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Invoice Created!</h2>
      <p className="text-slate-500">Redirecting...</p>
    </div>
  );

  if (preview) return (
    <div className="max-w-xl mx-auto p-6">
      <button onClick={() => setPreview(false)} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 text-sm">
        <ArrowLeftIcon /> Back to form
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Confirm & Send</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        {finalEmail && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📧</span>
                <p className="text-xs font-bold text-slate-500 uppercase">Message Preview</p>
              </div>
              <button onClick={() => setEditMessage(!editMessage)} className="text-xs text-orange-500 font-semibold hover:underline">
                {editMessage ? 'Done' : '✏️ Edit'}
              </button>
            </div>
            {editMessage ? (
              <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={3}
                className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{messageText}</p>
            )}
          </div>
        )}
        {finalEmail && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📧</span>
                <p className="text-xs font-bold text-slate-500 uppercase">Message Preview</p>
              </div>
              <button onClick={() => setEditMessage(!editMessage)} className="text-xs text-orange-500 font-semibold hover:underline">
                {editMessage ? 'Done' : '✏️ Edit'}
              </button>
            </div>
            {editMessage ? (
              <div className="space-y-3">
                <input value={emailSubj} onChange={e => setEmailSubj(e.target.value)}
                  className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={5}
                  className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">Subject: {emailSubj}</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{messageText}</p>
              </div>
            )}
          </div>
        )}
{!finalEmail && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-2xl">⚠️</div>
            <p className="text-sm text-amber-700">Add an email above so Remindrr can send reminders.</p>
          </div>
        )}
        {taxRate > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
            <span className="font-semibold text-green-800">Invoice Total:</span>{' '}
            <span className="font-bold text-green-800">${total.toFixed(2)}</span>
            <span className="text-green-600"> (${subtotal.toFixed(2)} + {taxName} ${taxAmount.toFixed(2)})</span>
          </div>
        )}
        <button onClick={handleConfirm} disabled={saving}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50">
          {saving ? 'Creating...' : '✅ Confirm & Create Invoice'}
        </button>
      </div>
    </div>
  );
  
  // Main form
  return (
      <div className="max-w-xl mx-auto p-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 text-sm">
        <ArrowLeftIcon /> Back to Invoices
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">New Invoice</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Invoice # <span className="text-slate-400 font-normal">(optional — leave blank if using your own numbering)</span></label>
          <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g. #001, HOB-1042, Invoice-0425"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
        <div className="flex gap-2">
          <button onClick={() => setUseNew(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!useNew ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Existing Client</button>
          <button onClick={() => setUseNew(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${useNew ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>New Client</button>
        </div>
        {useNew ? (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Acme Contracting"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="client@example.com"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
          </div>
        ) : (
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">— Choose a client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? c.phone : c.email ? c.email : ''}</option>)}
            </select></div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="850.00"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <select value={selectedState} onChange={e => {
              const state = e.target.value;
              setSelectedState(state);
              if (state && state !== 'custom') {
                const rate = stateRates[state];
                setTaxRate(rate);
                setTaxName(stateLabels[state] || state);
              }
            }}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Select state...</option>
              <optgroup label="US States">
                <option value="AL">Alabama (4-11%)</option>
                <option value="AK">Alaska (0%)</option>
                <option value="AZ">Arizona (5.6-11.2%)</option>
                <option value="AR">Arkansas (6.5-11%)</option>
                <option value="CA">California (7.25-10.25%)</option>
                <option value="CO">Colorado (2.9-10%)</option>
                <option value="CT">Connecticut (6.35%)</option>
                <option value="DE">Delaware (0%)</option>
                <option value="FL">Florida (6-7%)</option>
                <option value="GA">Georgia (4-8%)</option>
                <option value="HI">Hawaii (4-11%)</option>
                <option value="ID">Idaho (6-9%)</option>
                <option value="IL">Illinois (6.25-11%)</option>
                <option value="IN">Indiana (7%)</option>
                <option value="IA">Iowa (6-7%)</option>
                <option value="KS">Kansas (6.5-10.5%)</option>
                <option value="KY">Kentucky (6%)</option>
                <option value="LA">Louisiana (4.45-11%)</option>
                <option value="ME">Maine (5.5-7%)</option>
                <option value="MD">Maryland (6%)</option>
                <option value="MA">Massachusetts (6.25%)</option>
                <option value="MI">Michigan (6%)</option>
                <option value="MN">Minnesota (6.875-11%)</option>
                <option value="MS">Mississippi (7-9%)</option>
                <option value="MO">Missouri (4.225-10%)</option>
                <option value="MT">Montana (0%)</option>
                <option value="NE">Nebraska (5.5-8%)</option>
                <option value="NV">Nevada (6.85-8.1%)</option>
                <option value="NH">New Hampshire (0%)</option>
                <option value="NJ">New Jersey (6.625-9.9%)</option>
                <option value="NM">New Mexico (4.875-9%)</option>
                <option value="NY">New York (4-8.875%)</option>
                <option value="NC">North Carolina (4.75-7%)</option>
                <option value="ND">North Dakota (5-8%)</option>
                <option value="OH">Ohio (5.75-8%)</option>
                <option value="OK">Oklahoma (4.5-11%)</option>
                <option value="OR">Oregon (0%)</option>
                <option value="PA">Pennsylvania (6-8%)</option>
                <option value="RI">Rhode Island (7%)</option>
                <option value="SC">South Carolina (6-9%)</option>
                <option value="SD">South Dakota (4.5-6%)</option>
                <option value="TN">Tennessee (7-9.75%)</option>
                <option value="TX">Texas (6.25-8.2%)</option>
                <option value="UT">Utah (6.1-8.35%)</option>
                <option value="VT">Vermont (6-7%)</option>
                <option value="VA">Virginia (5.3-6%)</option>
                <option value="WA">Washington (6.5-10.4%)</option>
                <option value="WV">West Virginia (6-7%)</option>
                <option value="WI">Wisconsin (5-8%)</option>
                <option value="WY">Wyoming (4-6%)</option>
              </optgroup>
              <optgroup label="Canada">
                <option value="CA-BC">BC (GST + PST 12%)</option>
                <option value="CA-ON">Ontario (HST 13%)</option>
                <option value="CA-QC">Quebec (GST + QST 14.975%)</option>
                <option value="CA-AB">Alberta (GST 5%)</option>
                <option value="CA-MB">Manitoba (GST + PST 12%)</option>
                <option value="CA-SK">Saskatchewan (GST + PST 11%)</option>
                <option value="CA-NS">Nova Scotia (HST 15%)</option>
                <option value="CA-NB">New Brunswick (HST 15%)</option>
                <option value="CA-PE">Prince Edward Island (HST 15%)</option>
                <option value="CA-NL">Newfoundland (HST 15%)</option>
                <option value="CA-NT">Northwest Territories (GST 5%)</option>
                <option value="CA-YU">Yukon (GST 5%)</option>
                <option value="CA-NU">Nunavut (GST 5%)</option>
              </optgroup>
              <option value="custom">Custom rate...</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate %</label>
            <input 
              type="number" 
              step="0.01"
              value={taxRate} 
              onChange={e => {
                setTaxRate(Number(e.target.value));
                if (selectedState === 'custom') {
                  setTaxName('Custom');
                }
              }}
              placeholder="0"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" 
            />
          </div>
        </div>
        {taxRate > 0 && (
          <p className="text-sm text-slate-500 mt-1">Subtotal: ${subtotal.toFixed(2)} → Total: ${total.toFixed(2)}</p>
        )}
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Plumbing repair - 123 Main St"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
        <button onClick={() => setPreview(true)} disabled={!amount || !dueDate || (!useNew && !clientId) || (useNew && !newName)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
          Next: Preview →
        </button>
      </div>
    </div>
  );
}

function ClientsPage() {
  const navigate = useNavigate();
  const clients = getClients();
  const invoices = getInvoices();
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
        <button onClick={() => navigate('/clients/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30">
          <PlusIcon /> Add Client
        </button>
      </div>
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
          <div className="text-5xl mb-4">👷</div>
          <p className="text-slate-500 text-lg mb-3">No clients yet</p>
          <p className="text-slate-400 text-sm mb-5">Add clients when creating an invoice, or add them here.</p>
          <button onClick={() => navigate('/clients/new')} className="text-orange-500 font-bold hover:underline">Add your first client →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => {
            const cInv = invoices.filter(i => i.clientId === client.id);
            const owes = cInv.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
            const paid = cInv.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
            return (
              <div key={client.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{client.name}</p>
                    {client.company && <p className="text-slate-500 text-sm">{client.company}</p>}
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg">{cInv.length} inv</span>
                </div>
                <div className="space-y-1 mb-4">
                  {client.email && <p className="text-sm text-slate-500">📧 {client.email}</p>}
                  {client.phone && <p className="text-sm text-slate-500">📱 {client.phone}</p>}
                </div>
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 bg-amber-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-amber-600 font-medium">Owes</p>
                    <p className="font-bold text-amber-700">${owes.toFixed(2)}</p>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-600 font-medium">Paid</p>
                    <p className="font-bold text-green-700">${paid.toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/clients/new')} className="w-full text-sm text-orange-500 font-bold py-2 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors">
                  Add Invoice →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Protected Route wrapper ───────────────────────────────────────────────
function RequireAuth({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

// Track when a user just finished registering so we don't kick them back to /signup
const REGISTERED_KEY = 'remindrr_just_registered';
// ─── Seed demo data ──────────────────────────────────────────────────────────
async function seedDemoData() {
  const existing = getSettings();

  if (existing?.ownerName && existing.ownerName.trim() && existing.ownerName !== 'Demo User') {
    await ensureDemoAccount();
    try {
      const cloudData = await loadFromCloud();
      if (cloudData.settings) {
        saveSettings(cloudData.settings);
      }
      if (cloudData.invoices && cloudData.invoices.length > 0) {
        localStorage.setItem('remindrr_invoices', JSON.stringify(cloudData.invoices));
      }
      if (cloudData.clients && cloudData.clients.length > 0) {
        localStorage.setItem('remindrr_clients', JSON.stringify(cloudData.clients));
      }
    } catch (e) {
      // Silently fail cloud load — user can still use local data
    }
    return;
  }

  if (isAuthenticated()) {
    return;
  }

  saveSettings({
    businessName: 'Demo Business',
    ownerName: 'Demo User',
    email: 'demo@remindrr.app',
    phone: '',
    plan: 'starter',
  });
  await ensureDemoAccount();
}

// ─── App Router ─────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(() => getSettings());
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    Promise.all([seedDemoData(), checkAndFireAutoReminders()]).then(() => {
      setSettings(getSettings());
      setAuthed(isAuthenticated());
      setReady(true);
    });
  }, []);

  // Show nothing until demo data is ready
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg">R</div>
          <p className="text-slate-400 text-sm">Loading Remindrr...</p>
        </div>
      </div>
    );
  }

// Case 1: Has settings AND is logged in → show the app
  const hasSettings = !!settings?.ownerName?.trim();

  // User is logged in and has settings → full app access
  if (isAuthenticated() && hasSettings) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <NavBar />
          <Routes>
          <Route path="/reset" element={<ResetPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<NewInvoicePage />} />
          <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<AddClientPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
  }

  // Case 2: No settings yet → show landing page + auth (or onboarding if logged in)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset" element={<ResetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
