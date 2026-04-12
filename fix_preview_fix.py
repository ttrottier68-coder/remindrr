with open('/workspace/remindrr/Remindrr/src/App.tsx', 'r') as f:
    content = f.read()

old = '''  const [smsText, setSmsText] = useState('');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Sync preview text when defaults change (form fields or contact info updated)
  useEffect(() => {
    if (finalPhone) setSmsText(defaultSms);
  }, [amount, description, dueDate, finalPhone, finalName, paymentLink]);

  useEffect(() => {
    if (finalEmail) {
      setEmailSubj(defaultEmailSubject);
      setEmailBody(defaultEmailBody);
    }
  }, [amount, description, dueDate, finalEmail, finalName, paymentLink]);'''

new = '''  const [smsText, setSmsText] = useState(defaultSms);
  const [emailSubj, setEmailSubj] = useState(defaultEmailSubject);
  const [emailBody, setEmailBody] = useState(defaultEmailBody);

  // Keep preview text in sync when form fields change
  useEffect(() => {
    if (finalPhone) setSmsText(defaultSms);
  }, [amount, description, dueDate, finalPhone, finalName, paymentLink]);

  useEffect(() => {
    if (finalEmail) {
      setEmailSubj(defaultEmailSubject);
      setEmailBody(defaultEmailBody);
    }
  }, [amount, description, dueDate, finalEmail, finalName, paymentLink]);'''

content = content.replace(old, new)
with open('/workspace/remindrr/Remindrr/src/App.tsx', 'w') as f:
    f.write(content)
print('Done:', content.count('useEffect'))
