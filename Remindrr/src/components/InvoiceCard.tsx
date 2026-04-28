|import { useState } from 'react';|

|import { useNavigate } from 'react-router-dom';|

|import { getSettings, getClients, getInvoices, deleteInvoice, markInvoicePaid, syncInvoicesToServer, sendReminderNow } from '../lib/store';|

|import type { Invoice } from '../types';|

||

|interface Props {|

|  invoice: Invoice;|

|  onRefresh: () => void;|

|}|

||

|function getStatus(inv: Invoice) {|

|  const days = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / 86400000);|

|  if (inv.status === 'paid') return { label: 'PAID', bg: 'bg-green-100', text: 'text-green-700' };|

|  if (days < 0) return { label: 'OVERDUE', bg: 'bg-red-100', text: 'text-red-700' };|

|  if (days <= 3) return { label: 'DUE SOON', bg: 'bg-amber-100', text: 'text-amber-700' };|

|  return { label: 'PENDING', bg: 'bg-slate-100', text: 'text-slate-600' };|

|}|

||

|const TrashIcon = () => (|

|  |

|    |

|  |

|);|

||

|export function openInvoicePrint(invoice: Invoice) {|

|  const settings = getSettings();|

|  const client = getClients().find(c => c.id === invoice.clientId);|

|  const status = getStatus(invoice);|

|  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });|

|  const created = new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });|

||

|  const statusClass = invoice.status === 'paid' ? 'paid'|

|    : status.label === 'OVERDUE' ? 'overdue'|

|    : status.label === 'DUE SOON' ? 'duesoon' : 'pending';|

||

|  const html = <!DOCTYPE html>| |<html>| |<head>| |<meta charset="utf-8">| |<title>Invoice ${invoice.invoiceNumber || invoice.id}</title>| |<style>| |  * { margin: 0; padding: 0; box-sizing: border-box; }| |  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1e293b; padding: 48px; max-width: 800px; margin: 0 auto; }| |  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }| |  .brand-name { font-size: 28px; font-weight: 800; color: #1e293b; }| |  .brand-sub { font-size: 14px; color: #64748b; margin-top: 2px; }| |  .invoice-meta { text-align: right; }| |  .invoice-title { font-size: 36px; font-weight: 800; color: #f97316; letter-spacing: -1px; }| |  .invoice-number { font-size: 14px; color: #64748b; margin-top: 4px; }| |  .invoice-number strong { color: #334155; }| |  .divider { border: none; border-top: 2px solid #f1f5f9; margin: 32px 0; }| |  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }| |  .info-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px; }| |  .info-block p { font-size: 15px; color: #334155; line-height: 1.7; }| |  .info-block p strong { color: #1e293b; }| |  .info-block .right { text-align: right; }| |  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }| |  .status-paid { background: #dcfce7; color: #166534; }| |  .status-pending { background: #f1f5f9; color: #475569; }| |  .status-overdue { background: #fee2e2; color: #991b1b; }| |  .status-duesoon { background: #fef3c7; color: #92400e; }| |  .table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }| |  .table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; }| |  .table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155; }| |  .table td:last-child { text-align: right; font-weight: 600; }| |  .table .amount-row td { border-bottom: none; font-size: 18px; font-weight: 800; color: #1e293b; }| |  .table .amount-row td:last-child { color: #f97316; }| |  .payment-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }| |  .payment-box h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 12px; }| |  .payment-link { color: #f97316; font-size: 15px; font-weight: 600; word-break: break-all; }| |  .footer { margin-top: 48px; text-align: center; font-size: 13px; color: #94a3b8; }| |  @media print { body { padding: 24px; } }| |</style>| |</head>| |<body>| || |<div class="header">| |  <div>| |    <div class="brand-name">${settings.businessName || 'Remindrr'}</div>| |    ${settings.ownerName ? 

{settings.ownerName}</div>` : ''}|
|    {settings.email ? <div class="brand-sub">${settings.email}</div> : ''}|

|    {settings.phone ? `<div class="brand-sub">{settings.phone}
: ''}| |  </div>| |  <div class="invoice-meta">| |    <div class="invoice-title">INVOICE</div>| |    ${invoice.invoiceNumber ?
#{invoice.invoiceNumber}</strong></div>` : ''}|
|  </div>|
|</div>|
||
|<div class="info-grid">|
|  <div class="info-block">|
|    <h3>Bill To</h3>|
|    <p><strong>{client?.name || invoice.clientName}
|

|    {client?.email ? `<p>{client.email}
: invoice.clientEmail ?
{invoice.clientEmail}</p>` : ''}|
|    {client?.phone ? <p>${client.phone}</p> : invoice.clientPhone ? <p>${invoice.clientPhone}</p> : ''}|

|  

|

|  
|

|    
|

|      
Invoice Details
|

|      
invoice.status=== 
′
 paid 
′
 ? 
′
 PAID 
′
 :status.label</span></p>∣∣<pstyle="margin−top:8px"><strong>Created:</strong>{created}

|

|      
Due: dueDate</p>∣∣</div>∣∣</div>∣∣</div>∣∣∣∣<tableclass="table">∣∣<thead>∣∣<tr>∣∣<th>Description</th>∣∣<thstyle="text−align:right">Amount</th>∣∣</tr>∣∣</thead>∣∣<tbody>∣∣<tr>∣∣<td>{invoice.description || 'Professional services'}|

|      invoice.amount.toLocaleString( 
′
 en−US 
′
 ,minimumFractionDigits:2)</td>∣∣</tr>∣∣<trclass="amount−row">∣∣<td><strong>TotalDue</strong></td>∣∣<td>{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}|

|    |

|  |

||

||

|{invoice.status !== 'paid' && invoice.paymentLink ? `|
|<div class="payment-box">|
|  <h3>Pay Online</h3>|
|  <a class="payment-link" href="{invoice.paymentLink}">{invoice.paymentLink}</a>|
|</div>|
|` : ''}|
||
|<div class="footer">|
|  <p>Generated by Remindrr &mdash; {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

|

|
|

||

||

|;| || |  const win = window.open('', '_blank', 'width=800,height=900');| |  if (win) {| |    win.document.write(html);| |    win.document.close();| |  }| |}| || |export function InvoiceCard({ invoice, onRefresh }: Props) {| |  const navigate = useNavigate();| |  const client = getClients().find(c => c.id === invoice.clientId);| |  const st = getStatus(invoice);| |  const days = Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / 86400000);| |  const [sendingReminder, setSendingReminder] = useState(false);| |  const [reminderSent, setReminderSent] = useState(false);| || |  const handleDelete = () => {| |    if (confirm('Delete this invoice?')) {| |      deleteInvoice(invoice.id);| |      syncInvoicesToServer(getInvoices());| |      onRefresh();| |    }| |  };| || |  const handleSendReminder = async () => {| |    setSendingReminder(true);| |    const result = await sendReminderNow(invoice);| |    setSendingReminder(false);| |    if (result.success) {| |      setReminderSent(true);| |      setTimeout(() => setReminderSent(false), 3000);| |    }| |  };| || |  return (| |    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">| |      <div className="flex items-center justify-between flex-wrap gap-3">| |        <div className="flex-1 min-w-0">| |          <div className="flex items-center gap-3 mb-1 flex-wrap">| |            <p className="font-bold text-slate-800 text-lg">{invoice.amount.toLocaleString()}</p>| |            <span className={px-2.5 py-0.5 rounded-full text-xs font-bold st.bg{st.text}}>{st.label}</span>| |          </div>| |          <p className="text-slate-500 text-sm truncate">{client?.name || invoice.clientName} · {invoice.description}</p>| |          <p className="text-slate-400 text-xs mt-1">| |            Due: {new Date(invoice.dueDate).toLocaleDateString()}| |            {invoice.status !== 'paid' && (days < 0 ?  · Math.abs(days)doverdue‘:days===0? 
′
 ⋅Duetoday 
′
 :‘⋅{days}d left)}| |          </p>| |        </div>| |        <div className="flex items-center gap-2 flex-wrap">| |          {invoice.status !== 'paid' && (| |            <button onClick={handleSendReminder} disabled={sendingReminder}| |              className={text-sm font-bold px-4 py-2 rounded-lg transition-colors {reminderSent ? 'bg-green-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>|
|              {sendingReminder ? 'Sending...' : reminderSent ? 'Sent! ✓' : 'Send Reminder 🔔'}|
|            </button>|
|          )}|
|          {invoice.status !== 'paid' && invoice.paymentLink && (|
|            <a href={invoice.paymentLink} target="_blank" rel="noreferrer"|
|              className="text-sm bg-green-50 text-green-700 font-bold px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">Payment Link →</a>|
|          )}|
|          {invoice.status !== 'paid' && (|
|            <button onClick={() => { markInvoicePaid(invoice.id); syncInvoicesToServer(getInvoices()); onRefresh(); }}|
|              className="text-sm bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Mark Paid ✓</button>|
|          )}|
|          <button onClick={() => openInvoicePrint(invoice)}|
|            className="text-sm bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">Download</button>|
|          <button onClick={() => navigate(`/invoices/{invoice.id}/edit`)}|

|            className="text-sm bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Edit|

|          |

|        
|

|      |

|    |

|  );|

|}|

