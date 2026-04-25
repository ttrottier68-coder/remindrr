import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';
import { getSettings } from '../lib/reminder-data';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) { setError('Please fill in all fields'); return; }
  setLoading(true);
  setError('');
  try {
    const err = await login(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    const freshSettings = getSettings();
    if (freshSettings?.ownerName) {
      window.location.href = '/';
    } else {
      window.location.href = '/onboarding';
    }
  } catch (err) {
    setLoading(false);
    setError('An error occurred. Please try again.');
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800">Remindrr</h1>
          <p className="text-slate-500 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="off"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-800 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="off"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-800" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-orange-600 hover:underline font-medium">Forgot password?</Link>
          </div>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-orange-600 font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
