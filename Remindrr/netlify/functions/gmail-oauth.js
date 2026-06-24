// Netlify Function: gmail-oauth.js
// Handles Gmail OAuth:
//   GET  /gmail-oauth           → return OAuth URL (GET /)
//   GET  /gmail-oauth?code=... → token exchange (Google redirect target)
//   POST /gmail-oauth/exchange → exchange auth code for tokens (called by frontend popup)
//   POST /gmail-oauth/refresh  → refresh access token
//   POST /gmail-oauth/revoke   → revoke access

const CLIENT_ID     = process.env.GMAIL_ID;
const CLIENT_SECRET = process.env.GMAIL_KEY;
const REDIRECT_URI  = 'https://remindrr.app/.netlify/functions/gmail-oauth';

const HEADERS_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

function htmlResponse(title, color, message) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;}
    .card{background:white;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;max-width:400px;}
    .icon{font-size:48px;margin-bottom:16px;}
    h2{color:#1e293b;margin:0 0 12px;font-size:22px;}
    p{color:#64748b;margin:0 0 24px;font-size:14px;line-height:1.6;}
    .spinner{width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#f97316;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style></head><body>
  <div class="card">
    ${color === 'loading' ? '<div class="spinner"></div>' : `<div class="icon">${color === 'success' ? '✅' : '❌'}</div>`}
    <h2>${title}</h2>
    <p>${message}</p>
  </div>
  <script>
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    window.opener && window.opener.postMessage({ type: 'GMAIL_OAUTH', code, error }, 'https://remindrr.app');
    setTimeout(() => { if (window.opener) window.close(); }, 1500);
  </script>
</body></html>`;
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  // Parse body for internal routing (frontend calls POST /.netlify/functions/gmail-oauth with {path:"/exchange"} etc.)
  let bodyPath = null;
  if (event.httpMethod === 'POST' && event.body) {
    try { bodyPath = JSON.parse(event.body).path || null; } catch (_) {}
  }

  // Route based on bodyPath for POST, or event.path for GET
  if (bodyPath) {
    // Internal routing via body.path (POST only)
    if (bodyPath === '/exchange') {
      // POST /gmail-oauth/exchange (internal)
      // ... fall through to existing /exchange handler below
    } else if (bodyPath === '/refresh') {
      // POST /gmail-oauth/refresh (internal) — handle here inline
      if (!CLIENT_ID || !CLIENT_SECRET) {
        return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Gmail OAuth not configured' }) };
      }
      let body;
      try { body = JSON.parse(event.body); } catch (_) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
      }
      const { refreshToken } = body;
      if (!refreshToken) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Missing refreshToken' }) };
      }
      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
            refresh_token: refreshToken, grant_type: 'refresh_token',
          }),
        });
        const data = await res.json();
        if (data.error) {
          return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: data.error_description || data.error }) };
        }
        return {
          statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }),
        };
      } catch (err) {
        return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Token refresh failed: ' + err.message }) };
      }
    } else if (bodyPath === '/revoke') {
      // POST /gmail-oauth/revoke (internal) — handle inline
      let body;
      try { body = JSON.parse(event.body); } catch (_) {}
      const { accessToken } = body || {};
      if (accessToken) {
        try { await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`); } catch (_) {}
      }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true }) };
    }
  }

  // Netlify Functions: event.path includes /.netlify/functions/ prefix
  // e.g. /.netlify/functions/gmail-oauth or /.netlify/functions/gmail-oauth/exchange
  const FN = '/.netlify/functions/gmail-oauth';
  const path = event.path || '';
  const suffix = path.startsWith(FN) ? path.slice(FN.length) || '/' : path;
  const fullUrl = 'https://remindrr.app' + event.path + (event.rawQuery ? '?' + event.rawQuery : '');

  // GET /gmail-oauth → return OAuth URL (only when NO query params)
  if (event.httpMethod === 'GET' && suffix === '/' && !event.rawQuery) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Gmail OAuth not configured. Set GMAIL_ID and GMAIL_KEY in Netlify env vars.' }) };
    }
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/gmail.send');
    const state = Math.random().toString(36).substring(2);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state}`;
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, url: authUrl, state }) };
  }

  // GET /gmail-oauth?code=... → Google redirected back (must check BEFORE OAuth URL branch)
  if (event.httpMethod === 'GET' && event.rawQuery) {
    const parsed = new URL(fullUrl);
    const code  = parsed.searchParams.get('code');
    const error = parsed.searchParams.get('error');

    if (error || !code) {
      return {
        statusCode: 302,
        headers: { ...cors, 'Location': 'https://remindrr.app/?gmail_error=' + encodeURIComponent(error || 'access_denied') },
        body: '',
      };
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return {
        statusCode: 302,
        headers: { ...cors, 'Location': 'https://remindrr.app/?gmail_error=Gmail OAuth not configured' },
        body: '',
      };
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
          code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI,
        }),
      });
      const data = await tokenRes.json();
      if (data.error) {
        return {
          statusCode: 302,
          headers: { ...cors, 'Location': 'https://remindrr.app/?gmail_error=' + encodeURIComponent(data.error_description || data.error) },
          body: '',
        };
      }
      let email = '';
      try { email = JSON.parse(Buffer.from(data.id_token.split('.')[1], 'base64').toString()).email; } catch (_) {}
      const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      // Redirect to app with tokens in URL params (app will save them to localStorage)
      const redirectUrl = 'https://remindrr.app/?gmail_connected=1&email=' + encodeURIComponent(email) +
        '&accessToken=' + encodeURIComponent(data.access_token) +
        '&refreshToken=' + encodeURIComponent(data.refresh_token) +
        '&expiresAt=' + expiresAt;
      return { statusCode: 302, headers: { ...cors, 'Location': redirectUrl }, body: '' };
    } catch (err) {
      return {
        statusCode: 302,
        headers: { ...cors, 'Location': 'https://remindrr.app/?gmail_error=' + encodeURIComponent(err.message) },
        body: '',
      };
    }
  }

  // POST /gmail-oauth/exchange
  if (event.httpMethod === 'POST' && suffix === '/exchange') {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Gmail OAuth not configured' }) };
    }
    let body;
    try { body = JSON.parse(event.body); } catch (_) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
    }
    const { code: authCode } = body;
    if (!authCode) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Missing code' }) };
    }
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
          code: authCode, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI,
        }),
      });
      const data = await res.json();
      if (data.error) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: data.error_description || data.error }) };
      }
      let email = '';
      try { email = JSON.parse(Buffer.from(data.id_token.split('.')[1], 'base64').toString()).email; } catch (_) {}
      return {
        statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true, accessToken: data.access_token,
          refreshToken: data.refresh_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000, email,
        }),
      };
    } catch (err) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Token exchange failed: ' + err.message }) };
    }
  }

  // POST /gmail-oauth/refresh
  if (event.httpMethod === 'POST' && suffix === '/refresh') {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Gmail OAuth not configured' }) };
    }
    let body;
    try { body = JSON.parse(event.body); } catch (_) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
    }
    const { refreshToken } = body;
    if (!refreshToken) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Missing refreshToken' }) };
    }
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
          refresh_token: refreshToken, grant_type: 'refresh_token',
        }),
      });
      const data = await res.json();
      if (data.error) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: data.error_description || data.error }) };
      }
      return {
        statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }),
      };
    } catch (err) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Token refresh failed: ' + err.message }) };
    }
  }

  // POST /gmail-oauth/revoke
  if (event.httpMethod === 'POST' && suffix === '/revoke') {
    let body;
    try { body = JSON.parse(event.body); } catch (_) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
    }
    const { accessToken } = body;
    if (accessToken) {
      try { await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`); } catch (_) {}
    }
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 404, headers: cors, body: JSON.stringify({ success: false, message: 'Not found', path: event.path, suffix }) };
};
