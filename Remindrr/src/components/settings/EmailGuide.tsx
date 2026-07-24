// Email setup guide — covers Resend (recommended) and SendGrid.

import { useState } from 'react';
import { ChevronIcon } from './Icons';

export function EmailGuide() {
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
