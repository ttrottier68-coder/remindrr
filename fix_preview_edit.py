with open('/workspace/remindrr/Remindrr/src/App.tsx', 'r') as f:
    content = f.read()

old = '''  const [preview, setPreview] = useState(false);
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

  const handleConfirm = async () => {'''

new = '''  const [preview, setPreview] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editSms, setEditSms] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const selectedClient = clients.find(c => c.id === clientId);
  const finalPhone = useNew ? newPhone : (selectedClient?.phone || '');
  const finalEmail = useNew ? newEmail : (selectedClient?.email || '');
  const finalName = useNew ? newName : (selectedClient?.name || '');
  const invId = 'inv_' + Math.random().toString(36).slice(2, 11);
  const paymentLink = `https://pay.stripe.com/pay/${invId}#demo`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const defaultSms = finalPhone
    ? `Hi ${finalName} 👋 Reminder: Your invoice of $${amount || '0'} for "${description || 'your service'}" is due on ${formatDate(dueDate)}. Pay now: ${paymentLink}`
    : '';
  const defaultEmailSubject = finalEmail ? `Payment Reminder: Invoice for ${description || 'your service'}` : '';
  const defaultEmailBody = finalEmail
    ? `Hi ${finalName},\\n\\nJust a friendly reminder that your invoice of $${amount || '0'} for "${description || 'your service'}" is due on ${formatDate(dueDate)}.\\n\\nPay now: ${paymentLink}\\n\\nThanks for your business!`
    : '';

  const [smsText, setSmsText] = useState(defaultSms);
  const [emailSubj, setEmailSubj] = useState(defaultEmailSubject);
  const [emailBody, setEmailBody] = useState(defaultEmailBody);

  const handleConfirm = async () => {'''

content = content.replace(old, new)
with open('/workspace/remindrr/Remindrr/src/App.tsx', 'w') as f:
    f.write(content)
print('Step 1 done:', 'defaultSms' in content)
