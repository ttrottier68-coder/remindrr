with open('/workspace/remindrr/Remindrr/src/App.tsx', 'r') as f:
    content = f.read()

old = '''  if (preview) return (
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
  );'''

new = '''  if (preview) return (
    <div className="max-w-xl mx-auto p-6">
      <button onClick={() => setPreview(false)} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 text-sm">
        <ArrowLeftIcon /> Back to form
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Confirm & Send</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        {finalPhone && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <p className="text-xs font-bold text-slate-500 uppercase">SMS Preview</p>
              </div>
              <button onClick={() => setEditSms(!editSms)} className="text-xs text-orange-500 font-semibold hover:underline">
                {editSms ? 'Done' : '✏️ Edit'}
              </button>
            </div>
            {editSms ? (
              <textarea value={smsText} onChange={e => setSmsText(e.target.value)} rows={3}
                className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{smsText}</p>
            )}
          </div>
        )}
        {finalEmail && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📧</span>
                <p className="text-xs font-bold text-slate-500 uppercase">Email Preview</p>
              </div>
              <button onClick={() => setEditEmail(!editEmail)} className="text-xs text-orange-500 font-semibold hover:underline">
                {editEmail ? 'Done' : '✏️ Edit'}
              </button>
            </div>
            {editEmail ? (
              <div className="space-y-3">
                <input value={emailSubj} onChange={e => setEmailSubj(e.target.value)}
                  className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={5}
                  className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">Subject: {emailSubj}</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{emailBody}</p>
              </div>
            )}
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
  );'''

content = content.replace(old, new)
with open('/workspace/remindrr/Remindrr/src/App.tsx', 'w') as f:
    f.write(content)
print('Step 2 done:', 'editSms' in content)
