// ─── Account Debug ───────────────────────────────────────────────────────────
import { useState } from 'react';
import { login, register } from '../lib/auth';

export default function AccountDebug() {
  const [show, setShow] = useState(false);
  const [result, setResult] = useState('');

  // Read directly from localStorage using auth.ts keys
  const rawPasswords = localStorage.getItem('remindrr_passwords') || '{}';
  const session = localStorage.getItem('remindrr_auth') || 'null';
  const email = localStorage.getItem('remindrr_user_email') || '';
  let sessionObj: any = null;
  try { sessionObj = JSON.parse(session); } catch {}

  const storedPasswords = (() => {
    try { return Object.keys(JSON.parse(rawPasswords)); } catch { return []; }
  })();

  const handleAutoLogin = async () => {
    const targetEmail = 'ttrottier68@gmail.com';
    const tempPw = 'TempLogin2024!';
    // Register with temp password (will update if exists)
    await register(targetEmail, tempPw, 'Troy', 'UBS Industries');
    // Now login
    const err = await login(targetEmail, tempPw);
    if (!err) {
      setResult(`✅ Logged in! Email: ${targetEmail}`);
      setTimeout(() => { localStorage.setItem('remindrr_onboarding_complete', 'true'); window.location.reload(); }, 1500);
    } else {
      setResult(`❌ Login failed: ${err}`);
    }
  };

  const handleReset = () => {
    localStorage.clear();
    setResult('✅ All data cleared. Go to /signup to register.');
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🔧</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Account Debug</p>
            <p className="text-slate-500 text-xs">Troubleshoot login issues</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{show ? 'Hide' : 'Show'}</span>
      </button>

      {show && (
        <div className="px-4 pb-4 border-t border-amber-200 pt-3 space-y-3 text-xs">
          <div className="bg-white rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Logged in as:</span>
              <span className="font-mono text-slate-700">{email || '(none)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Session valid:</span>
              <span className={`font-mono ${sessionObj ? 'text-green-600' : 'text-red-500'}`}>
                {sessionObj ? '✅ yes' : '❌ no'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Passwords stored:</span>
              <span className="font-mono text-slate-700">{storedPasswords.length} account(s)</span>
            </div>
            {storedPasswords.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Stored accounts:</span>
                <span className="font-mono text-slate-700">{storedPasswords.join(', ')}</span>
              </div>
            )}
          </div>

          {result && (
            <div className={`rounded-lg p-3 ${result.includes('✅') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
              {result}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <p className="text-blue-800 font-semibold">Quick Fix</p>
            <button
              onClick={handleAutoLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              🔧 Auto-Login as ttrottier68@gmail.com
            </button>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors"
          >
            Sign Out & Clear All Data
          </button>
        </div>
      )}
    </div>
  );
}
