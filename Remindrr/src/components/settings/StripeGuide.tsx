// Stripe setup guide — collapsible accordion that walks the user through
// signing up for Stripe and getting their Account ID.

import { useState } from 'react';
import { ChevronIcon } from './Icons';

export function StripeGuide() {
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
            <Step n={1} title='Go to stripe.com and click "Start now"' body="Use your email and create a password. It's free to sign up." />
            <Step n={2} title="Enter your business details" body="Name, address, bank info (for payouts). Stripe is secure and trusted by millions of businesses." />
            <Step n={3} title="Verify your email address" body="Stripe will send you an email—click the link inside to confirm your account." />
            <Step
              n={4}
              title="Copy your Stripe Account ID"
              body={
                <>
                  Log into stripe.com → look at the top-left corner next to your business name. It looks like:{' '}
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">acct_1A2B3C4D5E6F</span> — copy that whole thing.
                </>
              }
            />
            <Step n={5} title="Paste it into the field on this page and click Save" body="That's it! Your account is connected. You'll get an email from Stripe when your first payout is ready." />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <span className="font-semibold">Note:</span> Stripe has a 2-day payout delay for new accounts—this is normal and improves as you build history with them.
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-slate-500 text-xs mt-1">{body}</p>
      </div>
    </div>
  );
}
