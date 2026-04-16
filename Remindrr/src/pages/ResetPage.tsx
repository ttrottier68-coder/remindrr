import { useNavigate } from 'react-router-dom';

export default function ResetPage() {
  const navigate = useNavigate();

  const handleReset = () => {
    localStorage.clear();
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Reset Account</h1>
        <p className="text-slate-500 mb-6">
          This will clear all local data including any demo account and let you start fresh with your own account.
        </p>
        <button
          onClick={handleReset}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors mb-3"
        >
          Clear All Data & Go to Login
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-3 rounded-xl transition-colors"
        >
          Cancel — Go Back
        </button>
        <p className="text-xs text-slate-400 mt-4">
          Your invoices and settings stored on this device will be cleared. This cannot be undone.
        </p>
      </div>
    </div>
  );
}