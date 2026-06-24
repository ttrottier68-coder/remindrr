import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'
import { saveGmailTokens } from './lib/reminder-data.ts'

// Handle Gmail OAuth redirect
const params = new URLSearchParams(window.location.search)
if (params.get('gmail_connected') === '1') {
  const tokenData = {
    accessToken:  params.get('accessToken')  || '',
    refreshToken: params.get('refreshToken') || '',
    expiresAt:    Number(params.get('expiresAt')) || 0,
    email:        params.get('email')        || '',
  }
  if (tokenData.refreshToken) {
    saveGmailTokens(tokenData)
    sessionStorage.setItem('gmail_oauth_done', '1')
    sessionStorage.setItem('gmail_oauth_email', tokenData.email || '')
  }
  // Inject done page without React
  document.getElementById('root')!.innerHTML = `
    <div style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;margin:0;">
      <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;max-width:360px;">
        <div style="font-size:56px;margin-bottom:16px;">✅</div>
        <h2 style="color:#1e293b;margin:0 0 8px;">Gmail Connected!</h2>
        <p style="color:#64748b;margin:0 0 24px;">You can close this tab and go back to Remindrr.</p>
        <button onclick="window.close()" style="background:#f97316;color:white;border:none;padding:12px 28px;border-radius:8px;cursor:pointer;font-size:15px;font-weight:500;">Close Tab</button>
      </div>
    </div>
  `
  // Signal opener to reload, then stop here
  if (window.opener) {
    window.opener.postMessage({ type: 'GMAIL_OAUTH_DONE' }, 'https://remindrr.app')
  }
  // No React render needed for this page
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
