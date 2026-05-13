import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings } from '../lib/reminder-data';
import { getTrialDaysLeft } from '../types';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function PlansPage() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [showGuide, setShowGuide] = useState(false);
  const daysLeft = getTrialDaysLeft(settings);

  // If user is on paid starter plan, redirect to dashboard
  useEffect(() => {
    if (settings?.plan === 'starter') {
      navigate('/');
    }
  }, [settings, navigate]);

  const handleStartTrial = () => {
    saveSettings({
      plan: 'trial',
      trialStartDate: new Date().toISOString(),
    });
    navigate('/onboarding');
  };

  const handleStartStarter = () => {
    window.open('https://buy.stripe.com/4gM9AU3nIaoE26YdS21wY01', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 text-sm font-medium">← Back</button>
          <h1 className="text-lg font-bold text-slate-800">Plans & Pricing</h1>
          <div />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Trial banner */}
        {settings?.plan === 'trial' && daysLeft > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-10 text-center">
            <div className="text-4xl mb-2">⏳</div>
            <h2 className="text-xl font-bold text-orange-800 mb-1">Your free trial is active!</h2>
            <p className="text-orange-700 mb-4">
              You have <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> left in your trial. Enjoy full access — no credit card needed.
            </p>
            <button
              onClick={handleStartStarter}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:opacity-90 transition-opacity"
            >
              Unlock full access — $29/mo →
            </button>
            <p className="text-orange-500 text-xs mt-3">Cancel anytime. No contracts.</p>
          </div>
        )}

        {/* Trial expired banner */}
        {settings?.plan === 'trial' && daysLeft === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10 text-center">
            <div className="text-4xl mb-2">⏰</div>
            <h2 className="text-xl font-bold text-red-800 mb-1">Your free trial has ended</h2>
            <p className="text-red-700 mb-4">Upgrade to Starter to keep using Remindrr.</p>
            <button
              onClick={handleStartStarter}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
            >
              Upgrade to Starter — $29/mo →
            </button>
          </div>
        )}

        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Simple, honest pricing</h2>
          <p className="text-slate-500">Start free. Upgrade when you're ready.</p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Trial Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">FREE</span>
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1">Free Trial</h2>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-black text-slate-900">$0</span>
                <span className="text-slate-400 text-sm font-medium">/ 14 days</span>
              </div>
              <p className="text-slate-500 text-sm mb-5">Try everything before you buy. No credit card required.</p>
              <ul className="space-y-2 mb-6">
                {['Full access for 14 days', 'Unlimited invoices', 'Unlimited clients', 'Email reminders', 'PayPal, Venmo & Zelle'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleStartTrial}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Start Free Trial →
              </button>
            </div>
          </div>

          {/* Starter Card */}
          <div className="bg-white rounded-2xl border-2 border-orange-400 shadow-sm overflow-hidden relative">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 text-center">
              BEST VALUE
            </div>
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-1">Starter</h2>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-black text-slate-900">$29</span>
                <span className="text-slate-400 text-sm font-medium">/month</span>
              </div>
              <p className="text-slate-500 text-sm mb-5">Full access, billed monthly. Cancel anytime.</p>
              <ul className="space-y-2 mb-6">
                {['Everything in the free trial', 'Unlimited use — no limits', 'Priority email support', 'All features included'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://buy.stripe.com/4gM9AU3nIaoE26YdS21wY01"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:opacity-90 transition-opacity"
              >
                Get Started →
              </a>
              <p className="text-xs text-slate-400 text-center mt-3">Secured by Stripe · Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span>🔒 Secured by Stripe</span>
          <span>✅ No credit card for trial</span>
          <span>💳 Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}