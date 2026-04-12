/**
 * Remindrr Data Server
 * Lightweight HTTP server that receives invoice data from the app
 * and writes it to invoices.json for the reminder engine to read.
 * 
 * Runs on port 3000. App POSTs invoice data here on every change.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'invoices.json');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', invoices: JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{"invoices":[],"settings":{}}').invoices?.length || 0 }));
    return;
  }

  if (req.method === 'POST' && req.url === '/invoices') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{"invoices":[],"settings":{}}');
        existing.invoices = payload.invoices || [];
        existing.settings = { ...existing.settings, ...payload.settings };
        fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: (existing.invoices || []).length }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`Remindrr data server running on port ${PORT}`);
});
