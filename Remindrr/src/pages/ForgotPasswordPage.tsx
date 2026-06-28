import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

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

    try {
      const { sendPasswordResetEmail } = await import('../lib/firebase');
      const normalized = email.toLowerCase().trim();
      await sendPasswordResetEmail(normalized);
      setDone(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Don't reveal whether email exists — show success anyway
        setDone(true);
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
    setLoading(false);
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Check your inbox</h1>
          <p className="text-slate-500 text-sm mb-6">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your spam folder if you don't see it within a few minutes.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-opacity"
          >
            Back to sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Forgot password?</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Enter your email and we'll send you a reset link.
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
          {loading ? 'Sending...' : 'Send reset link'}
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
