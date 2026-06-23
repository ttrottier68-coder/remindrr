import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'
import { saveGmailTokens } from './lib/reminder-data.ts'

// Handle Gmail OAuth redirect — save tokens from URL params then clean URL
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
  }
  // Clean URL but redirect to Settings so user sees the connected state
  window.history.replaceState({}, '', '/settings')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
