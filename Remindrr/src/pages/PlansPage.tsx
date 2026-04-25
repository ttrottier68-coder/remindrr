import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from from '../lib/reminder-data';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    description: 'Perfect for solo contractors getting started.',
    features: [
      'Up to 25 invoices/month',
      'Automated SMS & email reminders',
      'Up to 50 clients',
      'Payment link generation',
      'Invoice tracking dashboard',
      'Email support',
    ],
    color: 'border-slate-200',
    badge: null,
    paymentLink: 'https://buy.stripe.com/4gM9AU3nIaoE26YdS21wY01',
  },
  {
    name: 'Pro',
    price: '$59',
    period: '/mo',
    description: 'For growing businesses with more clients.',
    features: [
      'Unlimited invoices',
      'Automated SMS & email reminders',
      'Unlimited clients',
      'Payment link generation',
      'Invoice tracking dashboard',
      'Priority phone & email support',
      'Custom branding',
    ],
    color: 'border-orange-400',
    badge: 'MOST POPULAR',
    paymentLink: 'https://buy.stripe.com/fZu8wQe2mcwMfXOaFQ1wY02',
  },
  {
    name: 'Business',
    price: '$129',
    period: '/mo',
    description: 'For established companies at scale.',
    features: [
      'Everything in Pro',
      'White-label invoice links',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    color: 'border-slate-200',
    badge: null,
    paymentLink: 'https://buy.stripe.com/8x28wQ0bw0O46neg0a1wY03',
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 text-sm font-medium">← Back</button>
          <h1 className="text-lg font-bold text-slate-800">Choose Your Plan</h1>
          <div />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* ── Stripe Setup Guide Toggle ── */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowGuide(g => !g)}
            className="text-sm text-orange-500 hover:underline font-medium"
          >
            {showGuide ? 'Hide' : 'How do I set up Pro & Business in Stripe?'}
          </button>

          {showGuide && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-left max-w-2xl mx-auto text-sm text-slate-700">
              <h3 className="font-bold text-blue-800 mb-3">📋 How to create Pro & Business Stripe Payment Links</h3>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Log into <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">dashboard.stripe.com</a></li>
                <li>In the left menu: <strong>Products → + Add product</strong></li>
                <li><strong>Name:</strong> "Remindrr Pro Plan" · <strong>Price:</strong> $59.00/month · recurring · click <strong>Add product</strong></li>
                <li>Repeat for Business: name "Remindrr Business Plan" · $129.00/month</li>
                <li>For each product: click <strong>→ Payment link</strong> · click <strong>Add pricing page</strong> · copy the URL</li>
                <li>Come back here and paste those URLs in the code (or send them to Max)</li>
              </ol>
              <p className="mt-3 text-blue-600 font-medium">Need help? Stripe's docs: <a href="https://stripe.com/docs/payments/payment-links" target="_blank" rel="noopener noreferrer" className="underline">stripe.com/docs/payments/payment-links</a></p>
            </div>
          )}
        </div>

        {/* Current plan badge */}
        {settings?.plan && settings.plan !== 'starter' && (
          <div className="text-center mb-6">
            <span className="bg-orange-100 text-orange-700 text-sm font-bold px-4 py-1.5 rounded-full">
              Current plan: {settings.plan}
            </span>
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 ${plan.color} shadow-sm overflow-hidden relative`}
            >
              {plan.badge && (
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 text-center">
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-black text-slate-800 mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-sm font-medium">{plan.period}</span>
                </div>
                <p className="text-slate-500 text-sm mb-5">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon /><span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center font-bold py-3 rounded-xl transition-colors ${
                    plan.badge
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:opacity-90'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.paymentLink.includes('YOUR_') ? '⚠️ Set up in Stripe first' : `Get Started →`}
                </a>

                {plan.paymentLink.includes('YOUR_') && (
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Need to create this in Stripe →
                    <button onClick={() => setShowGuide(true)} className="text-orange-500 hover:underline ml-1">see guide above</button>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Trust footer */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span>🔒 Secured by Stripe</span>
          <span>✅ Cancel anytime</span>
          <span>💳 No credit card required to start</span>
        </div>
      </div>
    </div>
  );
}
