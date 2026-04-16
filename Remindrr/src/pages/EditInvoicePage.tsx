import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoices, getClients, saveInvoice } from '../lib/store';
import type { Invoice } from '../types';

export default function EditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = getInvoices().find((i: Invoice) => i.id === id);
  const client = invoice ? getClients().find(c => c.id === invoice.clientId) : null;

  const [clientName, setClientName] = useState(invoice?.clientName || '');
  const [clientPhone, setClientPhone] = useState(invoice?.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(invoice?.clientEmail || '');
  const [amount, setAmount] = useState(invoice ? String(invoice.amount) : '');
  const [description, setDescription] = useState(invoice?.description || '');
  const [dueDate, setDueDate] = useState(invoice?.dueDate?.split('T')[0] || '');
  const [saving, setSaving] = useState(false);

  if (!invoice) return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <p className="text-slate-500">Invoice not found.</p>
      <button onClick={() => navigate('/invoices')} className="mt-4 text-orange-500 font-bold">← Back to Invoices</button>
    </div>
  );

  const handleSave = async () => {
    if (!amount || !dueDate || !clientName) return;
    setSaving(true);
    saveInvoice({
      ...invoice,
      clientName,
      clientPhone: clientPhone,
      clientEmail: clientEmail,
      amount: parseFloat(amount),
      description,
      dueDate,
      status: invoice.status,
    });
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    navigate('/invoices');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 text-sm">
        ← Back to Invoices
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Invoice</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
          <input value={clientName} onChange={e => setClientName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone (for SMS)</label>
          <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email (for reminders)</label>
          <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
            placeholder="client@example.com"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate('/invoices')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
