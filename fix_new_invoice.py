with open('/workspace/remindrr/Remindrr/src/App.tsx', 'r') as f:
    content = f.read()

old = '''function NewInvoicePage() {
  const navigate = useNavigate();
  const clients = getClients();
  const [clientId, setClientId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState(false);
  const [done, setDone] = useState(false);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [useNew, setUseNew] = useState(false);
  const [saving, setSaving] = useState(false);

      paymentLink: `https://pay.stripe.com/pay/${invId}#demo`,
      createdAt: new Date().toISOString(),
    });
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setDone(true);
    await new Promise(r => setTimeout(r, 1200));
    navigate('/invoices');
  };

  if (done) return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Invoice Created!</h2>
      <p className="text-slate-500">Redirecting...</p>
    </div>
  );

  return ('''

new = '''function NewInvoicePage() {
  const navigate = useNavigate();
  const clients = getClients();
  const [clientId, setClientId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [useNew, setUseNew] = useState(false);
  const [preview, setPreview] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedClient = clients.find(c => c.id === clientId);
  const finalPhone = useNew ? newPhone : (selectedClient?.phone || '');
  const finalEmail = useNew ? newEmail : (selectedClient?.email || '');
  const finalName = useNew ? newName : (selectedClient?.name || '');
  const invId = 'inv_' + Math.random().toString(36).slice(2, 11);
  const paymentLink = `https://pay.stripe.com/pay/${invId}#demo`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const smsMessage = finalPhone
    ? `Hi ${finalName} 👋 Reminder: Your invoice of $${amount || '0'} for "${description || 'your service'}" is due on ${formatDate(dueDate)}. Pay now: ${paymentLink}`
    : null;
  const emailSubject = finalEmail ? `Payment Reminder: Invoice for ${description || 'your service'}` : null;
  const emailBody = finalEmail
    ? `Hi ${finalName},\\n\\nJust a friendly reminder that your invoice of $${amount || '0'} for "${description || 'your service'}" is due on ${formatDate(dueDate)}.\\n\\nPay now: ${paymentLink}\\n\\nThanks for your business!`
    : null;

  const handleConfirm = async () => {
    setSaving(true);
    let finalClientId = clientId;
    let finalClientName = finalName;
    if (useNew && newName) {
      finalClientId = 'cl_' + Math.random().toString(36).slice(2, 11);
      saveClient({ id: finalClientId, name: newName, phone: newPhone, email: newEmail, createdAt: new Date().toISOString() });
      finalClientName = newName;
    }
    saveInvoice({
      id: invId, clientId: finalClientId, clientName: finalClientName,
      clientPhone: finalPhone, clientEmail: finalEmail,
      amount: parseFloat(amount), description, dueDate, status: 'pending',
      paymentLink, createdAt: new Date().toISOString(),
    });
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setDone(true);
    await new Promise(r => setTimeout(r, 1200));
    navigate('/invoices');
  };

  if (done) return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Invoice Created!</h2>
      <p className="text-slate-500">Redirecting...</p>
    </div>
  );

  if (preview) return (
    <div className="max-w-xl mx-auto p-6">
      <button onClick={() => setPreview(false)} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 text-sm">
        <ArrowLeftIcon /> Back to form
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Confirm & Send</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        {smsMessage && (
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl">💬</div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">SMS Preview</p>
              <p className="text-sm text-slate-700 leading-relaxed">{smsMessage}</p>
            </div>
          </div>
        )}
        {emailSubject && (
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl">📧</div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email Preview</p>
              <p className="text-xs text-slate-600 font-semibold mb-1">Subject: {emailSubject}</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{emailBody}</p>
            </div>
          </div>
        )}
        {!finalPhone && !finalEmail && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="text-sm font-semibold text-amber-800">No contact info</p>
              <p className="text-sm text-amber-600">Add a phone or email above so Remindrr can send reminders.</p>
            </div>
          </div>
        )}
        <button onClick={handleConfirm} disabled={saving}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50">
          {saving ? 'Creating...' : '✅ Confirm & Create Invoice'}
        </button>
      </div>
    </div>
  );

  return ('''

content = content.replace(old, new)
with open('/workspace/remindrr/Remindrr/src/App.tsx', 'w') as f:
    f.write(content)
print('Done')
