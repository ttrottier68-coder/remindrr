/**
 * Remindrr Data Sync Server
 * Receives invoice data from the Remindrr app and stores it for the reminder engine.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_DIR = '/tmp/remindrr-data';
const DATA_FILE = path.join(DATA_DIR, 'invoices.json');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {}

function safeReadFile(filepath, fallback) {
  try { const d = fs.readFileSync(filepath, 'utf8'); return d || fallback; } 
  catch(e) { return fallback; }
}

function safeWriteFile(filepath, data) {
  try { fs.writeFileSync(filepath, data); return true; } 
  catch(e) { return false; }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && req.url === '/health') {
    const raw = safeReadFile(DATA_FILE, '{"invoices":[]}');
    let count = 0;
    try { count = JSON.parse(raw).invoices?.length || 0; } catch(e) {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', invoices: count }));
    return;
  }

  if (req.method === 'POST' && req.url === '/invoices') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const raw = safeReadFile(DATA_FILE, '{"invoices":[],"settings":{}}');
        const existing = JSON.parse(raw);
        existing.invoices = payload.invoices || [];
        existing.settings = { ...existing.settings, ...payload.settings };
        safeWriteFile(DATA_FILE, JSON.stringify(existing, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: existing.invoices.length }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/reminders') {
    const { spawn } = require('child_process');
    const engine = spawn('node', ['/workspace/remindrr/reminders/reminder-engine.js'], { cwd: '/workspace/remindrr/reminders' });
    let output = '';
    engine.stdout.on('data', d => output += d);
    engine.stderr.on('data', d => output += d);
    engine.on('close', code => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ran: true, code, output }));
    });
    return;
  }

  res.writeHead(404); res.end();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Remindrr sync server running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
