import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { register } from '../lib/auth';
import { saveSettings } from '../lib/store';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill email when arriving from forgot-password flow
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) setForm(f => ({ ...f, email: emailFromUrl }));
  }, [searchParams]);

  const set = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    // Normalize email the same way auth.ts does — critical for login to find the account
    const normalizedEmail = form.email.toLowerCase().trim();

    const err = await register(form.email, form.password, form.name, form.businessName);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    // Use same normalized email key that register() used — this is the login bug fix
    saveSettings({
      ownerName: form.name,
      businessName: form.businessName || '',
      email: normalizedEmail,
      phone: '',
      plan: 'starter',
    });
    setLoading(false);
    window.location.replace('/onboarding');
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
        <p className="text-slate-500 mt-1 text-sm">Start managing invoices in minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Mike Thompson"
            autoComplete="name"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
          <input
            type="text"
            value={form.businessName}
            onChange={e => set('businessName', e.target.value)}
            placeholder="Mike's Plumbing (optional)"
            autoComplete="organization"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => set('confirmPassword', e.target.value)}
            placeholder="Same as above"
            autoComplete="new-password"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity mt-2"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-500 font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
// fix: ensure clean build 1776026284
