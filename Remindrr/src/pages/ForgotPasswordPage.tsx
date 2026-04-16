import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { clearPassword, emailExists } from '../lib/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);

    // Small delay to feel like we're "checking"
    await new Promise(r => setTimeout(r, 600));

    const normalized = email.toLowerCase().trim();
    if (!emailExists(normalized)) {
      setError('No account found with this email address.');
      setLoading(false);
      return;
    }

    // Clear the password — next step is to set a new one
    clearPassword(normalized);
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Password reset!</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your password has been cleared. You can now create a new one.
          </p>
          <button
            onClick={() => navigate(`/signup?email=${encodeURIComponent(email)}`)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-opacity"
          >
            Create new password
          </button>
          <p className="text-center text-sm text-slate-500 mt-4">
            Remember your password?{' '}
            <button onClick={() => navigate('/login')} className="text-orange-500 font-bold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Forgot password?</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Enter your email and we'll reset it for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Checking...' : 'Reset password'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Remember your password?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-orange-500 font-bold hover:underline"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
