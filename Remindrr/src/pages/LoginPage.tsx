import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../lib/auth';
import { saveSettings, getSettings, loadFromCloud } from '../lib/reminder-data';
import AuthLayout from '../components/AuthLayout';

const SETTINGS_KEY = 'remindrr_settings';
const INVOICES_KEY = 'remindrr_invoices';
const CLIENTS_KEY  = 'remindrr_clients';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const hasData = raw && raw !== 'null' && raw !== 'undefined' && JSON.parse(raw)?.data?.ownerName;
      window.location.href = hasData ? '/' : '/onboarding';
    }
  }, []);

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSubmitted) return;
    if (!email || !password) { setError('Please fill in all fields'); return; }

    setHasSubmitted(true);
    setLoading(true);
    setError('');

    try {
      const err = await login(email, password);
      setLoading(false);
      if (err) {
        setError(err);
        setHasSubmitted(false);
        return;
      }

      // ─── Restore settings from localStorage ─────────────────────────────
      // Check RAW localStorage first (bypasses getSettings() defaults).
      // This is the single source of truth — if remindrr_settings exists
      // and is non-empty, the user has data and we go home, not onboarding.
      let hasLocalData = false;
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw && raw !== 'null' && raw !== 'undefined') {
          const parsed = JSON.parse(raw);
          // Unwrap {data:{...}} wrapper if present
          const data = (parsed && parsed.data) ? parsed.data : parsed;
          hasLocalData = !!(data && (data.ownerName || data.businessName || data.email));
        }
      } catch { /* ignore */ }

      // Try cloud (Firebase) — only runs if Firebase is configured
      let cloudData = { settings: null, invoices: null, clients: null };
      try {
        cloudData = await loadFromCloud();
      } catch { /* ignore */ }

      if (cloudData.settings) {
        // Cloud has data — merge with any local-only fields (logo, Gmail tokens)
        const fresh = getSettings();
        const merged = { ...fresh, ...cloudData.settings };
        saveSettings(merged);
        if (cloudData.invoices) localStorage.setItem(INVOICES_KEY, JSON.stringify(cloudData.invoices));
        if (cloudData.clients) localStorage.setItem(CLIENTS_KEY, JSON.stringify(cloudData.clients));
        window.location.href = '/';
      } else if (hasLocalData) {
        // Local data exists — just refresh the page; settings are already in localStorage
        window.location.href = '/';
      } else {
        // No data anywhere — first time user → onboarding
        saveSettings({
          ownerName: '',
          businessName: '',
          email: email.toLowerCase().trim(),
          phone: '',
          plan: 'starter',
        });
        window.location.href = '/onboarding';
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again.');
      setHasSubmitted(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-slate-500 mt-1 text-sm">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
          Sign up
        </Link>
      </div>

      <div className="mt-2 text-center">
        <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-slate-600">
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}