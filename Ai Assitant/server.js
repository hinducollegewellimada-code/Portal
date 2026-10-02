// B/Hindu College AI Assistant local server
// Keeps GROQ_API_KEY out of the public HTML/browser.
// Windows PowerShell: $env:GROQ_API_KEY="your_key_here"; node server.js
// Windows CMD: set GROQ_API_KEY=your_key_here && node server.js
// Then open: http://localhost:3000/

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'openai/gpt-oss-20b';
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, type='application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 2_000_000) req.destroy();
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'POST' && url.pathname === '/api/chat') {
      if (!GROQ_API_KEY) {
        return send(res, 500, {error: 'GROQ_API_KEY is not set on the server.'});
      }
      const raw = await readBody(req);
      let payload;
      try { payload = JSON.parse(raw || '{}'); }
      catch { return send(res, 400, {error: 'Invalid JSON request.'}); }

      const upstream = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: Array.isArray(payload.messages) ? payload.messages : [],
          max_completion_tokens: Math.min(Number(payload.max_completion_tokens) || 1024, 2048)
        })
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
      return res.end(text);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, {error:'Method not allowed.'});

    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const file = path.resolve(ROOT, '.' + pathname);
    if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return send(res, 403, {error:'Forbidden.'});

    fs.stat(file, (err, stat) => {
      if (err || !stat.isFile()) return send(res, 404, {error:'Not found.'});
      res.writeHead(200, {'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'});
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).pipe(res);
    });
  } catch (err) {
    console.error(err);
    send(res, 500, {error:'Server error.'});
  }
});

server.listen(PORT, () => {
  console.log(`B/Hindu College AI Assistant: http://localhost:${PORT}/`);
  console.log(GROQ_API_KEY ? 'Groq server key: loaded.' : 'WARNING: GROQ_API_KEY is not set; school knowledge still works.');
});
