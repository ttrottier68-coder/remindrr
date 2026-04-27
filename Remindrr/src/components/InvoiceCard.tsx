import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSettings, getClients, getInvoices, deleteInvoice, markInvoicePaid, syncInvoicesToServer, sendReminderNow } from '../lib/store';
import type { Invoice } from "../types";

interface Props {
  invoice: Invoice;
  onRefresh: () => void;
}

function getStatus(inv: Invoice) {
  const days = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / 86400000);
  if (inv.status === "paid") return { label: "PAID", bg: "bg-green-100", text: "text-green-700" };
  if (days < 0) return { label: "OVERDUE", bg: "bg-red-100", text: "text-red-700" };
  if (days <= 3) return { label: "DUE SOON", bg: "bg-amber-100", text: "text-amber-700" };
  return { label: "PENDING", bg: "bg-slate-100", text: "text-slate-600" };
}

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export function InvoiceCard({ invoice, onRefresh }: Props) {
  const navigate = useNavigate();
  const client = getClients().find(c => c.id === invoice.clientId);
  const st = getStatus(invoice);
  const days = Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / 86400000);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const handleDelete = () => {
    if (confirm('Delete this invoice?')) {
      deleteInvoice(invoice.id);
      syncInvoicesToServer(getInvoices());
      onRefresh();
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    const result = await sendReminderNow(invoice);
    setSendingReminder(false);
    if (result.success) {
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <p className="font-bold text-slate-800 text-lg">${invoice.amount.toLocaleString()}</p>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>{st.label}</span>
          </div>
          <p className="text-slate-500 text-sm truncate">{client?.name || invoice.clientName} · {invoice.description}</p>
          <p className="text-slate-400 text-xs mt-1">
            Due: {new Date(invoice.dueDate).toLocaleDateString()}
            {invoice.status !== 'paid' && (days < 0 ? ` · ${Math.abs(days)}d overdue` : days === 0 ? ' · Due today' : ` · ${days}d left`)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== 'paid' && (
            <button onClick={handleSendReminder} disabled={sendingReminder}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${reminderSent ? 'bg-green-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
              {sendingReminder ? 'Sending...' : reminderSent ? 'Sent! ✓' : 'Send Reminder 🔔'}
            </button>
          )}
          {invoice.status !== 'paid' && invoice.paymentLink && (
            <a href={invoice.paymentLink} target="_blank" rel="noreferrer"
              className="text-sm bg-green-50 text-green-700 font-bold px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">Payment Link →</a>
          )}
          {invoice.status !== 'paid' && (
            <button onClick={() => { markInvoicePaid(invoice.id); syncInvoicesToServer(getInvoices()); onRefresh(); }}
              className="text-sm bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Mark Paid ✓</button>
          )}
          <button onClick={handleDelete} className="text-red-400 hover:text-red-600 p-2 transition-colors"><TrashIcon /></button>
        </div>
      </div>
    </div>
  );
}
