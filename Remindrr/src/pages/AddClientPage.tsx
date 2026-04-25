import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveClient, getClients } from '../lib/reminder-data';
import type { Client } from '../types';

export default function AddClientPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    if (!name) return;
    const client: Client = {
      id: 'cl_' + Math.random().toString(36).substr(2, 9),
      name,
      company,
      phone,
      email,
      createdAt: new Date().toISOString(),
    };
    saveClient(client);
    setSaved(true);
    setTimeout(() => navigate('/clients'), 1000);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <button onClick={() => navigate('/clients')} className="text-slate-500 hover:text-slate-800 mb-4 text-sm">← Back to Clients</button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Add New Client</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Smith Contracting (optional)" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 1234" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!name}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saved ? '✓ Saved! Redirecting...' : 'Add Client →'}
        </button>
      </div>
    </div>
  );
}
