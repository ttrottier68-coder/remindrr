// Gmail OAuth connection card. Handles the "Connect Gmail" / "Disconnect"
// state and reads the redirect-back state from sessionStorage when the
// OAuth popup completes.

import { useEffect, useState } from 'react';
import { getGmailAuthUrl } from '../../lib/reminder-data';

export function GmailSection() {
  const [state, setState] = useState<{ connected: boolean; email: string | null; error: string | null }>({
    connected: false,
    email: null,
    error: null,
  });
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('remindrr_gmail');
      if (stored) {
        const data = JSON.parse(stored);
        setState({ connected: true, email: data.email || null, error: null });
        return;
      }
    } catch (_) {}
    // Check sessionStorage for new-tab OAuth completion
    if (sessionStorage.getItem('gmail_oauth_done') === '1') {
      const email = sessionStorage.getItem('gmail_oauth_email') || '';
      setState({ connected: true, email, error: null });
      sessionStorage.removeItem('gmail_oauth_done');
      sessionStorage.removeItem('gmail_oauth_email');
    }
  }, []);

  const connectGmail = () => {
    setState(s => ({ ...s, error: null }));
    try {
      const authUrl = getGmailAuthUrl();
      window.open(authUrl, '_blank');
      setConnecting(true);
    } catch (err) {
      setState(s => ({ ...s, error: 'Could not connect. Please try again.' }));
      setConnecting(false);
    }
  };

  const disconnectGmail = () => {
    localStorage.removeItem('remindrr_gmail');
    setState({ connected: false, email: null, error: null });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">G</div>
        <div>
          <h2 className="font-bold text-slate-700 text-base">Email via Gmail</h2>
          <p className="text-slate-400 text-xs mt-0.5">Recommended — sends from your Gmail address, no domain needed</p>
        </div>
      </div>

      {state.connected ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {state.email ? state.email[0].toUpperCase() : 'G'}
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">Gmail connected</p>
              <p className="text-green-600 text-xs">{state.email}</p>
            </div>
          </div>
          <button onClick={disconnectGmail}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="font-semibold text-slate-700 text-sm mb-2">Best for contractors with Gmail accounts</p>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>✓ Sends from your own Gmail — no domain or extra account needed</li>
              <li>✓ Clients receive emails from a real address they recognize</li>
              <li>✓ Up to 500 emails/day with a free Gmail account</li>
            </ul>
          </div>
          <button
            onClick={connectGmail}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-blue-300 hover:border-blue-500 text-blue-700 font-bold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {connecting ? 'Connecting...' : 'Connect Gmail'}
          </button>
          {state.error && (
            <p className="text-red-500 text-xs">{state.error}</p>
          )}
          <p className="text-xs text-slate-400 text-center">You'll be redirected to sign in with Google. No password is stored.</p>
        </div>
      )}
    </div>
  );
}
