// OAuthCallback.tsx — handles Google OAuth redirect
// Google redirects here with ?code=xxx&state=xxx
// We exchange the code for tokens server-side and redirect to Settings

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      navigate('/settings?gmail_error=' + encodeURIComponent(error));
      return;
    }

    if (!code) {
      navigate('/settings');
      return;
    }

    // Verify state matches what we stored
    const savedState = sessionStorage.getItem('gmail_oauth_state');
    sessionStorage.removeItem('gmail_oauth_state');
    if (savedState && savedState !== state) {
      navigate('/settings?gmail_error=State mismatch. Please try again.');
      return;
    }

    // Exchange code for tokens via our server function
    fetch('/.netlify/functions/gmail-oauth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).then(r => r.json()).then(result => {
      if (result.success) {
        localStorage.setItem('remindrr_gmail', JSON.stringify({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt,
          email: result.email,
        }));
        navigate('/settings?gmail_connected=1');
      } else {
        navigate('/settings?gmail_error=' + encodeURIComponent(result.message || 'Failed to connect Gmail'));
      }
    }).catch(() => {
      navigate('/settings?gmail_error=Network error. Please try again.');
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔐</div>
        <p className="text-slate-500">Connecting Gmail...</p>
      </div>
    </div>
  );
}
