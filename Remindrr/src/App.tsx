import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getSettings, saveSettings, getDashboardStats, getInvoices, getClients, saveInvoice, saveClient, markInvoicePaid, deleteInvoice, syncInvoicesToServer, sendReminderNow } from './lib/reminder-data';
import { isAuthenticated, logout, ensureDemoAccount } from './lib/auth';
import type { Invoice, Client } from './types';
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
    // Clear onboarding flag so next login goes to onboarding, not loops back to landing
    try { localStorage.removeItem('remindrr_onboarding_complete'); } catch {}
    // Replace the current page so back-button doesn't undo logout
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
  const set = (k: string, v: string) => setS(ss => ({ ...ss, [k]: v }));
  const submit = () => { saveSettings(s as any); window.location.reload(); };
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
            <p className="text-slate-600 text-sm mb-3">Choose your plan. No credit card required.</p>
            {[['starter','Starter','$29.99/mo','50 clients · 200 SMS'],['pro','Pro','$59.99/mo','Unlimited clients & SMS'],['business','Business','$129/mo','Multi-user + API']].map(([id,label,price,desc]) => (
              <div key={id} onClick={() => setS(ss => ({ ...ss, plan: id as typeof ss.plan }))}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${s.plan === id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div><p className="font-bold text-slate-800">{label}</p><p className="text-sm text-slate-500">{desc}</p></div>
                  <p className="font-bold text-orange-500">{price}</p>
                </div>
              </div>
            ))}
            <button onClick={submit}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 mt-2">
              Get Started Free →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Upgrade Banner ────────────────────────────────────────────────────────────────
function UpgradeBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const count = getInvoices().length;
  if (count < 5) return null;
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white flex items-center justify-between gap-4 shadow-lg shadow-orange-200/50">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚀</span>
        <div>
          <p className="font-bold text-sm">
            {count >= 10 ? "You're a power user! Unlock Pro features →" : "Want to speed up your payments even more?"}
          </p>
          <p className="text-orange-100 text-xs">
            {count >= 10 ? "Advanced reminders · Custom templates · Priority SMS" : "Upgrade to Pro for advanced automation and custom message templates."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => window.location.href = '/settings'}
          className="bg-white text-orange-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
        >
          Upgrade to Pro
        </button>
        <button onClick={() => setDismissed(true)} className="text-orange-200 hover:text-white text-xs px-2 py-2">✕</button>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const stats = getDashboardStats();
  const all = getInvoices();
  const clients = getClients();
  const invoices = getInvoices().slice(-5).reverse();
  const cards = [
    { label: 'Total Sent', value: stats.totalOutstanding + stats.paidThisMonth, icon: <DollarIcon />, color: 'from-blue-500 to-blue-600' },
    { label: 'Collected', value: stats.paidThisMonth, icon: <CheckIcon />, color: 'from-green-500 to-green-600' },
    { label: 'Outstanding', value: stats.totalOutstanding, icon: <ClockIcon />, color: 'from-amber-500 to-amber-600' },
    { label: 'Overdue', value: stats.overdue, icon: <AlertIcon />, color: 'from-red-500 to-red-600' },
  ];
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Dashboard</h1><p className="text-slate-500 text-sm">{clients.length} clients · {all.length} invoices</p></div>
        <button onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30">
          <PlusIcon /> New Invoice
        </button>
      </div>

      <UpgradeBanner />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">{c.label}</p>
              <div className={`bg-gradient-to-br ${c.color} text-white p-2 rounded-lg shadow`}>{c.icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-800">${c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Why Remindrr? - dark gradient banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8">
        <h2 className="text-white text-xl font-bold mb-1">Why Remindrr?</h2>
        <p className="text-slate-400 text-sm mb-6">Built for tradespeople who are tired of chasing money.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '⚡', title: 'Get paid faster', desc: 'Friendly SMS reminders mean you get paid 3x faster.' },
            { icon: '🛡️', title: 'No awkward calls', desc: 'Automated reminders. No confrontation, no favour asking.' },
            { icon: '💳', title: 'Instant payments', desc: 'Clients tap a Stripe link in the SMS. Pays in 2 days.' },
            { icon: '💰', title: 'Affordable', desc: 'From $29.99/mo. A fraction of what collection agencies take.' },
          ].map(item => (
            <div key={item.title} className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-white font-bold text-sm">{item.title}</p>
              <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works - 3-step strip */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-2xl p-8">
        <h2 className="text-slate-800 text-xl font-bold mb-6 text-center">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Create an invoice', desc: 'Add your client and the amount they owe. Takes 30 seconds.' },
            { step: '2', title: 'Send a reminder', desc: 'Pick SMS, email, or both. Remindrr sends a friendly reminder automatically.' },
            { step: '3', title: 'Client pays online', desc: 'Your client taps the link in the message and pays via Stripe. Money lands in your account in 2 days.' },
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200 mb-3">{s.step}</div>
              <p className="font-bold text-slate-800 mb-1">{s.title}</p>
              <p className="text-slate-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Invoices</h2>
          <button onClick={() => navigate('/invoices')} className="text-sm text-orange-500 font-medium hover:underline">View all →</button>
        </div>
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-500 mb-4">No invoices yet</p>
            <button onClick={() => navigate('/invoices/new')} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-6 py-2.5 rounded-xl">Create your first invoice →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Client</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Amount</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Due</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {invoices.map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                const st = getStatus(inv);
                return (
                  <tr key={inv.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{client?.name || inv.clientName}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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
  const navigate = useNavigate();
  const handleSendReminder = async (inv: Invoice) => {
    setSendingId(inv.id);
    const result = await sendReminderNow(inv);
    setSendingId(null);
    if (!result.success) {
      alert(result.message);
    }
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
                        <button onClick={() => handleSendReminder(inv)} disabled={sendingId === inv.id}
                          className="text-xs bg-orange-50 text-orange-700 font-bold px-3 py-1 rounded-lg hover:bg-orange-100 disabled:opacity-50">
                          {sendingId === inv.id ? 'Sending...' : 'Send Reminder 🔔'}
                        </button>
                        <button onClick={() => { markInvoicePaid(inv.id); syncInvoicesToServer(getInvoices()); setTick(t => t + 1); }}
                          className="text-xs bg-green-500 text-white font-bold px-3 py-1 rounded-lg hover:bg-green-600">
                          Mark Paid ✓
                        </button>
                      </>
                    )}
                  </div>
                  <button onClick={() => navigate(`/invoices/${inv.id}/edit`)} className="text-sm text-orange-500 font-medium hover:underline">
                    View →
                  </button>
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
  const [reminderMethod, setReminderMethod] = useState<'sms' | 'email' | 'both'>('email');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [taxName, setTaxName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [useNew, setUseNew] = useState(false);
  const [preview, setPreview] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editSms, setEditSms] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const subtotal = parseFloat(amount) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const selectedClient = clients.find(c => c.id === clientId);
  const finalPhone = useNew ? newPhone : (selectedClient?.phone || '');
  const finalEmail = useNew ? newEmail : (selectedClient?.email || '');
  const finalName = useNew ? newName : (selectedClient?.name || '');
  const invId = 'inv_' + Math.random().toString(36).slice(2, 11);
  // Module-level formatDate is used here
  const paymentLink = `https://pay.stripe.com/pay/${invId}#demo`;

  const defaultSms = finalPhone
    ? `Hi ${finalName} 👋 Reminder: Your invoice of $${total.toFixed(2)} for "${description || 'your service'}"${taxRate > 0 ? ` (incl. ${taxName})` : ''} is due on ${formatDate(dueDate)}. Pay now: ${paymentLink}`
    : '';
  const defaultEmailSubject = finalEmail ? `Payment Reminder: Invoice for ${description || 'your service'}` : '';
  const defaultEmailBody = finalEmail
    ? `Hi ${finalName},\n\nJust a friendly reminder that your invoice of $${total.toFixed(2)} for "${description || 'your service'}"${taxRate > 0 ? ` (incl. ${taxName})` : ''} is due on ${formatDate(dueDate)}.\n\nPay now: ${paymentLink}\n\nThanks for your business!`
    : '';

  const [smsText, setSmsText] = useState('');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Populate preview text when preview screen first opens
  useEffect(() => {
    if (preview) {
      if (finalPhone) setSmsText(defaultSms);
      if (finalEmail) {
        setEmailSubj(defaultEmailSubject);
        setEmailBody(defaultEmailBody);
      }
    }
  }, [preview]);

  const handleConfirm = async () => {
    setSaving(true);
    let finalClientId = clientId;
    let finalClientName = finalName;
    if (useNew && newName) {
      finalClientId = 'cl_' + Math.random().toString(36).slice(2, 11);
      saveClient({ id: finalClientId, name: newName, phone: newPhone, email: newEmail, createdAt: new Date().toISOString() });
      finalClientName = newName;
    }
    saveInvoice({
      id: invId, invoiceNumber: invoiceNumber || undefined, clientId: finalClientId, clientName: finalClientName,
      clientPhone: finalPhone, clientEmail: finalEmail,
      amount: total, taxRate, taxName, subtotal,
      description, dueDate, status: 'pending',
      paymentLink, createdAt: new Date().toISOString(),
    });
    // Sync to server (no await - runs in background)
    syncInvoicesToServer(getInvoices());
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
        {finalPhone && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <p className="text-xs font-bold text-slate-500 uppercase">SMS Preview</p>
              </div>
              <button onClick={() => setEditSms(!editSms)} className="text-xs text-orange-500 font-semibold hover:underline">
                {editSms ? 'Done' : '✏️ Edit'}
              </button>
            </div>
            {editSms ? (
              <textarea value={smsText} onChange={e => setSmsText(e.target.value)} rows={3}
                className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{smsText}</p>
            )}
          </div>
        )}
        {finalEmail && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📧</span>
                <p className="text-xs font-bold text-slate-500 uppercase">Email Preview</p>
              </div>
              <button onClick={() => setEditEmail(!editEmail)} className="text-xs text-orange-500 font-semibold hover:underline">
                {editEmail ? 'Done' : '✏️ Edit'}
              </button>
            </div>
            {editEmail ? (
              <div className="space-y-3">
                <input value={emailSubj} onChange={e => setEmailSubj(e.target.value)}
                  className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={5}
                  className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">Subject: {emailSubj}</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{emailBody}</p>
              </div>
            )}
          </div>
        )}
        {!finalPhone && !finalEmail && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="text-sm font-semibold text-amber-800">No contact info</p>
              <p className="text-sm text-amber-600">Add a phone or email above so Remindrr can send reminders.</p>
            </div>
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
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone (for SMS reminders)</label>
              <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1 (555) 000-0000"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email (for email reminders)</label>
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
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate</label>
          <select value={taxRate} onChange={e => { setTaxRate(Number(e.target.value)); setTaxName(e.target.options[e.target.selectedIndex].dataset.label || ''); }}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value={0} data-label="">No tax (0%)</option>
            <option value={5} data-label="GST 5%">GST 5% (Canada federal)</option>
            <option value={7} data-label="GST + BC PST 7%">GST + BC PST 7%</option>
            <option value={12.975} data-label="GST + QST 12.975%">GST + QST 12.975% (Quebec)</option>
            <option value={13} data-label="HST 13%">HST 13% (Ontario/Atlantic)</option>
            <option value={12} data-label="GST + Manitoba PST 12%">GST + Manitoba PST 12%</option>
            <option value={11} data-label="GST + Saskatchewan PST 11%">GST + Saskatchewan PST 11%</option>
            <option value={8.25} data-label="US Sales Tax 8.25%">US Sales Tax 8.25%</option>
          </select>
          {taxRate > 0 && (
            <p className="text-sm text-slate-500 mt-1">Subtotal: ${subtotal.toFixed(2)} → Total: ${total.toFixed(2)}</p>
          )}
        </div>
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

// ─── Clients Page ────────────────────────────────────────────────────────────
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

// ─── Demo seed data ──────────────────────────────────────────────────────────
async function seedDemoData() {
  const existing = getSettings();
  if (existing?.ownerName) return; // don't overwrite
  await ensureDemoAccount();
}

// ─── App Router ─────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(() => getSettings());
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    // Run demo seeding on first mount
    seedDemoData().then(() => {
      // Re-read settings after seeding
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
  // Show onboarding first if not yet completed
  const onboardingComplete = typeof window !== 'undefined' && localStorage.getItem('remindrr_onboarding_complete') === 'true';
  // Redirect authenticated users without settings to onboarding
  if (isAuthenticated() && !settings?.ownerName) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
  if (settings?.ownerName && isAuthenticated()) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <NavBar />
          <Routes>
            {!onboardingComplete && <Route path="/onboarding" element={<OnboardingFlow />} />}
            <Route path="/reset" element={<ResetPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<NewInvoicePage />} />
            <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/new" element={<AddClientPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to={onboardingComplete ? '/' : '/onboarding'} replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  // Case 2: No settings yet → show landing page + auth
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset" element={<ResetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
// force fresh build
