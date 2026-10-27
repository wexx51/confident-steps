'use strict';
/*
 * Tiny server for "Уверенный шаг": serves the site from ../public and proxies AI requests.
 * The Anthropic API key stays on the server (never in the browser).
 *
 *   GEMINI_API_KEY=...  node server.js        (free key from Google AI Studio)
 *   or ANTHROPIC_API_KEY=sk-ant-...  node server.js   (paid Claude API)
 *
 * Optional env: PORT (3000), MODEL (default gemini-2.5-flash / claude-haiku-5-5), ALLOWED_ORIGIN (CORS, only if the site is hosted elsewhere),
 *               RATE_PER_MIN (12 requests per IP per minute), DAILY_LIMIT (500 requests per day for everyone).
 * Node 18+ is required. No npm packages.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const KEY = GEMINI_KEY || process.env.ANTHROPIC_API_KEY;
const PROVIDER = GEMINI_KEY ? 'gemini' : 'anthropic';
const MODEL = process.env.MODEL || (PROVIDER === 'gemini' ? 'gemini-2.5-flash' : 'claude-haiku-5-5');
const GEMINI_URL = process.env.GEMINI_URL || `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const ORIGIN = process.env.ALLOWED_ORIGIN || '';
const RATE = Number(process.env.RATE_PER_MIN) || 12;
const DAILY = Number(process.env.DAILY_LIMIT) || 500;
const PUBLIC = path.join(__dirname, '..', 'public');
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json'};

const hits = new Map();
let day = new Date().toDateString(), dayCount = 0;
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 60000);
  list.push(now); hits.set(ip, list);
  if (new Date().toDateString() !== day) { day = new Date().toDateString(); dayCount = 0; }
  dayCount++;
  return list.length > RATE || dayCount > DAILY;
}
setInterval(() => { const now = Date.now(); for (const [ip, l] of hits) if (!l.some(t => now - t < 60000)) hits.delete(ip); }, 60000).unref();

function send(res, code, body, headers = {}) {
  res.writeHead(code, Object.assign({'Content-Type': 'application/json; charset=utf-8'}, ORIGIN ? {'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type'} : {}, headers));
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

async function handleAI(req, res) {
  if (!KEY) return send(res, 503, {error: 'GEMINI_API_KEY (or ANTHROPIC_API_KEY) is not set'});
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (limited(ip)) return send(res, 429, {error: 'too many requests'});
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 2500000) return send(res, 413, {error: 'too large'}); }
  let prompt, image = null;
  try {
    const body = JSON.parse(raw);
    prompt = String(body.prompt || '');
    if (body.image && /^image\/(jpeg|png|webp)$/.test(body.image.mime) && typeof body.image.data === 'string' && body.image.data.length < 2000000) image = {mime: body.image.mime, data: body.image.data};
  } catch (_) { return send(res, 400, {error: 'bad json'}); }
  if (!prompt.trim() || prompt.length > 8000) return send(res, 400, {error: 'bad prompt'});
  try {
    let r, data, text;
    if (PROVIDER === 'gemini') {
      r = await fetch(GEMINI_URL, {method: 'POST', headers: {'content-type': 'application/json', 'x-goog-api-key': KEY},
        body: JSON.stringify({contents: [{role: 'user', parts: [{text: prompt}].concat(image ? [{inline_data: {mime_type: image.mime, data: image.data}}] : [])}], generationConfig: {maxOutputTokens: 600, temperature: 0.6}})});
      data = await r.json();
      text = ((data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || []).map(p => p.text || '').join('').trim();
    } else {
      r = await fetch(process.env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {method: 'POST',
        headers: {'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01'},
        body: JSON.stringify({model: MODEL, max_tokens: 500, messages: [{role: 'user', content: image ? [{type: 'image', source: {type: 'base64', media_type: image.mime, data: image.data}}, {type: 'text', text: prompt}] : prompt}]})});
      data = await r.json();
      text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    }
    if (!r.ok) { console.error('AI error', r.status, JSON.stringify(data).slice(0, 300)); return send(res, 502, {error: 'upstream ' + r.status}); }
    if (!text) return send(res, 502, {error: 'empty answer'});
    return send(res, 200, {text});
  } catch (e) { console.error(e); return send(res, 502, {error: 'upstream failed'}); }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/ai') {
    if (req.method === 'OPTIONS') return send(res, 204, '');
    if (req.method === 'POST') return handleAI(req, res);
    return send(res, 405, {error: 'POST only'});
  }
  let file = path.normalize(path.join(PUBLIC, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
  if (!file.startsWith(PUBLIC)) return send(res, 403, {error: 'forbidden'});
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, {error: 'not found'});
    res.writeHead(200, {'Content-Type': MIME[path.extname(file)] || 'application/octet-stream'});
    res.end(buf);
  });
}).listen(PORT, () => console.log(`http://localhost:${PORT}  (AI ${KEY ? 'on: ' + PROVIDER + ', model ' + MODEL : 'OFF: set GEMINI_API_KEY'})`));
