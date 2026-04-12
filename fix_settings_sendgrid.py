with open('/workspace/remindrr/Remindrr/src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

# 1. Add sendgridApiKey and sendgridFromEmail to form initial state
old1 = '''    stripeAccountId: '', twilioSid: '', twilioToken: '', twilioPhone: '',
    plan: 'starter',
  });'''
new1 = '''    stripeAccountId: '', twilioSid: '', twilioToken: '', twilioPhone: '',
    sendgridApiKey: '', sendgridFromEmail: '',
    plan: 'starter',
  });'''
content = content.replace(old1, new1)

# 2. Add SendGridGuide after TwilioGuide (before Connection Status)
old2 = '''// ─── Connection Status Badge ──────────────────────────────────────────────────'''
new2 = '''// ─── SendGrid Setup Guide ────────────────────────────────────────────────────
function SendGridGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-green-200 rounded-xl overflow-hidden bg-green-50/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">SENDGRID</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">How to set up SendGrid (step by step)</p>
            <p className="text-slate-500 text-xs mt-0.5">Takes about 5 minutes · Free tier (100 emails/day)</p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-green-200 pt-4 space-y-4 text-sm text-slate-700">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="font-bold text-slate-800 mb-2">📧 What is SendGrid?</p>
            <p className="text-slate-600 leading-relaxed">
              SendGrid sends email reminders to your customers when their invoices are due. It's the email equivalent of Twilio — reliable, professional, and won't go to spam when set up correctly.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-semibold text-slate-800">Sign up at sendgrid.com</p>
                <p className="text-slate-500 text-xs mt-1">Use the same email you use for Remindrr. Free tier is fine to start.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-semibold text-slate-800">Verify your sender email</p>
                <p className="text-slate-500 text-xs mt-1">Check your inbox for an email from SendGrid and click the verification link.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-semibold text-slate-800">Create an API Key</p>
                <p className="text-slate-500 text-xs mt-1">Go to <strong>Settings → API Keys → Create API Key → Full Access → Create & Copy</strong>. Paste it into the field on the left.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <div>
                <p className="font-semibold text-slate-800">Add your sender email</p>
                <p className="text-slate-500 text-xs mt-1">Enter the email you verified with (e.g. ttrottier68@gmail.com). This is who the emails appear to come from.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Connection Status Badge ──────────────────────────────────────────────────'''
content = content.replace(old2, new2)

# 3. Add SendGrid status to Connection Status section
old3 = '''          <StatusBadge label="Stripe" connected={!!form.stripeAccountId} fields={[form.stripeAccountId]} />
          <StatusBadge label="Twilio SMS" connected={!!(form.twilioSid && form.twilioToken && form.twilioPhone)} fields={[form.twilioSid, form.twilioToken, form.twilioPhone]} />
        </div>
        <StripeGuide />
        <TwilioGuide />'''
new3 = '''          <StatusBadge label="Stripe" connected={!!form.stripeAccountId} fields={[form.stripeAccountId]} />
          <StatusBadge label="Twilio SMS" connected={!!(form.twilioSid && form.twilioToken && form.twilioPhone)} fields={[form.twilioSid, form.twilioToken, form.twilioPhone]} />
          <StatusBadge label="SendGrid Email" connected={!!(form.sendgridApiKey && form.sendgridFromEmail)} fields={[form.sendgridApiKey, form.sendgridFromEmail]} />
        </div>
        <StripeGuide />
        <TwilioGuide />
        <SendGridGuide />'''
content = content.replace(old3, new3)

# 4. Add SendGrid form fields after Twilio fields (before Plan section)
old4 = '''          <TwilioGuide />
          <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-bold text-slate-700 text-base">💳 Stripe Payment Setup</h3>'''
new4 = '''          <TwilioGuide />
          <SendGridGuide />
          <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-bold text-slate-700 text-base">💳 Stripe Payment Setup</h3>'''
content = content.replace(old4, new4)

# 5. Add SendGrid fields after Twilio inputs (before Plan section)
old5 = '''          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Twilio Phone Number (with +1)</label>
            <input value={form.twilioPhone} onChange={e => set('twilioPhone', e.target.value)} placeholder="+15550001234"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-bold text-slate-700 text-base">📋 Plan</h3>'''
new5 = '''          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Twilio Phone Number (with +1)</label>
            <input value={form.twilioPhone} onChange={e => set('twilioPhone', e.target.value)} placeholder="+15550001234"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-bold text-slate-700 text-base">📧 SendGrid Email Setup</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">SendGrid API Key</label>
            <input type="password" value={form.sendgridApiKey} onChange={e => set('sendgridApiKey', e.target.value)} placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm" />
            <p className="text-xs text-slate-400 mt-1">Found at: Settings → API Keys → Create API Key → Full Access</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sender Email (From address)</label>
            <input type="email" value={form.sendgridFromEmail} onChange={e => set('sendgridFromEmail', e.target.value)} placeholder="ttrottier68@gmail.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm" />
            <p className="text-xs text-slate-400 mt-1">Must be verified in SendGrid → Sender Authentication</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-bold text-slate-700 text-base">📋 Plan</h3>'''
content = content.replace(old5, new5)

with open('/workspace/remindrr/Remindrr/src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)
print('Done. SendGrid added:', 'SendGridGuide' in content)
