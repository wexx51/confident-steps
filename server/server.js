'use strict';
/*
 * Tiny server for "Уверенный шаг": serves the site from ../public and proxies AI requests.
 * The Anthropic API key stays on the server (never in the browser).
 *
 *   GEMINI_API_KEY=...  node server.js        (free key from Google AI Studio)
 *   or ANTHROPIC_API_KEY=sk-ant-...  node server.js   (paid Claude API)
 *
 * Optional env: FALLBACK_MODELS (comma list, tried when MODEL is busy), PORT (3000), MODEL (default gemini-3.8-flash / claude-haiku-5-5), ALLOWED_ORIGIN (CORS, only if the site is hosted elsewhere),
 *               RATE_PER_MIN (12 requests per IP per minute), DAILY_LIMIT (500 requests per day for everyone),
 *               UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (free Upstash Redis for anonymous statistics),
 *               TTS_MODEL (Kazakh read-aloud through Gemini, default gemini-3.8-flash-lite-tts; needs GEMINI_API_KEY).
 * Node 18+ is required. No npm packages.
 */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const KEY = GEMINI_KEY || process.env.ANTHROPIC_API_KEY;
const PROVIDER = GEMINI_KEY ? 'gemini' : 'anthropic';
const MODEL = process.env.MODEL || (PROVIDER === 'gemini' ? 'gemini-3.5-flash-lite' : 'claude-haiku-5-5');
const GEMINI_URL = process.env.GEMINI_URL || `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const ORIGIN = process.env.ALLOWED_ORIGIN || '';
const RATE = Number(process.env.RATE_PER_MIN) || 12;
const DAILY = Number(process.env.DAILY_LIMIT) || 500;
const PUBLIC = path.join(__dirname, '..', 'public');
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml'};

/* offline support: sw.js gets the list of site files and a hash of their contents, so every deploy refreshes the saved copy */
function siteFiles(dir = PUBLIC) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.name.startsWith('.') ? [] : e.isDirectory() ? siteFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const OFFLINE = (() => {
  const files = siteFiles().filter(f => !f.endsWith('sw.js')).sort();
  const hash = crypto.createHash('sha1');
  files.forEach(f => { hash.update(f); hash.update(fs.readFileSync(f)); });
  const urls = ['/', ...files.map(f => '/' + path.relative(PUBLIC, f).split(path.sep).join('/'))];
  return {version: hash.digest('hex').slice(0, 12), urls};
})();

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

/* ---------- Kazakh read-aloud: few phones have a Kazakh voice, so the server asks Gemini TTS for one ----------
 * Lesson texts repeat for every visitor, so each clip is kept in memory and costs one request per server start. */
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-lite-tts';
const ttsCache = new Map(), ttsHits = new Map();
setInterval(() => ttsHits.clear(), 60000).unref();
function wav(pcm) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
async function handleTTS(req, res) {
  if (!GEMINI_KEY) return send(res, 503, {error: 'tts off'});
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 3000) return send(res, 413, {error: 'too large'}); }
  let text;
  try { text = String(JSON.parse(raw).text || '').trim().slice(0, 1200); } catch (_) { return send(res, 400, {error: 'bad json'}); }
  if (!text) return send(res, 400, {error: 'empty'});
  const key = crypto.createHash('sha1').update(text).digest('hex');
  let clip = ttsCache.get(key);
  if (!clip) {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const n = (ttsHits.get(ip) || 0) + 1; ttsHits.set(ip, n);
    if (n > 20) return send(res, 429, {error: 'too many requests'});
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {method: 'POST', headers: {'x-goog-api-key': GEMINI_KEY, 'content-type': 'application/json'}, signal: AbortSignal.timeout(30000),
        body: JSON.stringify({model: TTS_MODEL, input: [{type: 'user_input', content: [{type: 'text', text, annotations: [{type: 'speech_metadata', style: 'calm, slow and clear, in Kazakh, for an older listener'}]}]}], response_format: {type: 'audio'}, generation_config: {speech_config: [{voice: 'Kore'}]}})});
      if (!r.ok) throw new Error('tts ' + r.status + ' ' + (await r.text()).slice(0, 200));
      const data = await r.json();
      const audio = (data.steps || []).filter(st => st.type === 'model_output').flatMap(st => st.content || []).filter(c => c.type === 'audio').pop();
      if (!audio || !audio.data) throw new Error('tts: no audio');
      const buf = Buffer.from(audio.data, 'base64');
      clip = buf.slice(0, 4).toString() === 'RIFF' ? buf : wav(buf);
      if (ttsCache.size > 400) ttsCache.delete(ttsCache.keys().next().value);
      ttsCache.set(key, clip);
    } catch (e) { console.error(e.message); return send(res, 502, {error: 'tts unavailable'}); }
  }
  res.writeHead(200, {'Content-Type': 'audio/wav', 'Content-Length': clip.length, 'Cache-Control': 'no-store'});
  res.end(clip);
}

/* ---------- anonymous statistics: only totals are kept, no IP, no ids, no cookies, no texts ----------
 * Stored in Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set (free tier, survives
 * Render restarts), otherwise in memory (lost on restart; fine for local testing).
 * Keys: hash cs:stats (field -> count) and hash cs:days (YYYY-MM-DD -> visits).
 * New exercises must be added to LESSONS, other ids are ignored. */
const UP_URL = process.env.UPSTASH_REDIS_REST_URL, UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const LESSONS = ['text', 'address', 'file', 'message', 'egov', 'whatsapp', 'telegram', 'phone', 'internet', 'kaspi', 'kaspiqr', 'bankcall', 'tgscam', 'doctor', 'wavideo', 'kaspibill', 'smscode'];
const OSES = ['ios', 'android', 'windows', 'mac'], LANGS = ['ru', 'en', 'kk'];
const memStats = new Map(), memDays = new Map();
const statHits = new Map();
let statCache = null;
setInterval(() => statHits.clear(), 60000).unref();
async function upstash(commands) {
  const r = await fetch(UP_URL.replace(/\/$/, '') + '/pipeline', {method: 'POST', headers: {authorization: 'Bearer ' + UP_TOKEN, 'content-type': 'application/json'}, body: JSON.stringify(commands), signal: AbortSignal.timeout(5000)});
  if (!r.ok) throw new Error('upstash ' + r.status);
  return r.json();
}
/* turns one event from the page into counter names; anything unexpected gives no counters */
function counters(e) {
  const lesson = LESSONS.includes(e.id) ? e.id : null, os = OSES.includes(e.os) ? e.os : null;
  switch (e.e) {
    case 'visit': return ['visits', ...(LANGS.includes(e.lang) ? ['lang:' + e.lang] : []), ...(e.installed === true ? ['visits:installed'] : [])];
    case 'start': return lesson && os ? ['start:' + lesson, 'os:' + os] : [];
    case 'done': return lesson ? ['done:' + lesson] : [];
    case 'trainer': return Number.isInteger(e.score) && e.score >= 0 && e.score <= 10 ? ['trainer:runs', 'trainer:score:' + e.score] : [];
    case 'confidence': return ['before', 'after'].includes(e.phase) && Number.isInteger(e.value) && e.value >= 1 && e.value <= 5 && ['phone', 'computer'].includes(e.device) ? [`conf:${e.device}:${e.phase}:${e.value}`] : [];
    case 'share': case 'cheatsheet': case 'certificate': return lesson ? [e.e + ':' + lesson] : [];
    default: return [];
  }
}
async function handleStatsPost(req, res) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const n = (statHits.get(ip) || 0) + 1; statHits.set(ip, n);
  /* 120 events a minute per address leaves room for a whole class behind one school Wi-Fi */
  if (n > 120) return send(res, 429, {error: 'too many requests'});
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 600) return send(res, 413, {error: 'too large'}); }
  let names;
  try { names = counters(JSON.parse(raw)); } catch (_) { return send(res, 400, {error: 'bad json'}); }
  if (!names.length) return send(res, 204, '');
  const today = new Date().toISOString().slice(0, 10), visit = names.includes('visits');
  try {
    if (UP_URL && UP_TOKEN) await upstash([...names.map(f => ['HINCRBY', 'cs:stats', f, 1]), ...(visit ? [['HINCRBY', 'cs:days', today, 1]] : [])]);
    else { names.forEach(f => memStats.set(f, (memStats.get(f) || 0) + 1)); if (visit) memDays.set(today, (memDays.get(today) || 0) + 1); }
    statCache = null;
    send(res, 204, '');
  } catch (e) { console.error('stats', e.message); send(res, 502, {error: 'storage unavailable'}); }
}
async function handleStatsGet(res) {
  if (statCache && Date.now() - statCache.at < 60000) return send(res, 200, statCache.body);
  try {
    let totals, days;
    if (UP_URL && UP_TOKEN) {
      const [a, b] = await upstash([['HGETALL', 'cs:stats'], ['HGETALL', 'cs:days']]);
      const pairs = list => Object.fromEntries((list || []).reduce((acc, v, i, arr) => (i % 2 ? acc : [...acc, [v, Number(arr[i + 1])]]), []));
      totals = pairs(a.result); days = pairs(b.result);
    } else { totals = Object.fromEntries(memStats); days = Object.fromEntries(memDays); }
    const recent = Object.keys(days).sort().slice(-30);
    statCache = {at: Date.now(), body: {totals, days: Object.fromEntries(recent.map(d => [d, days[d]])), storage: UP_URL && UP_TOKEN ? 'upstash' : 'memory', lessons: LESSONS}};
    send(res, 200, statCache.body);
  } catch (e) { console.error('stats', e.message); send(res, 502, {error: 'storage unavailable'}); }
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
      const mk = think => JSON.stringify({contents: [{role: 'user', parts: [{text: prompt}].concat(image ? [{inline_data: {mime_type: image.mime, data: image.data}}] : [])}], generationConfig: Object.assign({maxOutputTokens: 700, temperature: 0.5}, think ? {thinkingConfig: {thinkingLevel: 'low'}} : {})});
      let think = true;
      const models = [MODEL].concat((process.env.FALLBACK_MODELS || 'gemini-3.5-flash-lite,gemini-3.8-flash,gemini-3.5-flash').split(',').map(x => x.trim()).filter(x => x && x !== MODEL));
      const started = Date.now();
      for (let i = 0; i < models.length; i++) {
        const url = process.env.GEMINI_URL || `https://generativelanguage.googleapis.com/v1beta/models/${models[i]}:generateContent`;
        for (let attempt = 0; attempt < 2; attempt++) {
          if (Date.now() - started > 24000) break;
          try {
            r = await fetch(url, {method: 'POST', headers: {'content-type': 'application/json', 'x-goog-api-key': KEY}, body: mk(think), signal: AbortSignal.timeout(8000)});
            data = await r.json();
          } catch (e) { r = null; data = {error: String(e && e.message)}; }
          if (r && r.ok) break;
          console.error('AI error', models[i], r ? r.status : 'net', JSON.stringify(data).slice(0, 200));
          if (r && r.status === 400 && think) { think = false; attempt--; continue; }
          if (r && (r.status === 400 || r.status === 401 || r.status === 403)) break;
          if (r && r.status === 404) break;
          await new Promise(ok => setTimeout(ok, 700));
        }
        if (r && r.ok) { if (i) console.log('AI served by fallback', models[i]); break; }
      }
      if (!r) return send(res, 504, {error: 'upstream failed'});
      text = ((data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || []).map(p => p.text || '').join('').trim();
    } else {
      r = await fetch(process.env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {method: 'POST',
        headers: {'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01'},
        body: JSON.stringify({model: MODEL, max_tokens: 500, messages: [{role: 'user', content: image ? [{type: 'image', source: {type: 'base64', media_type: image.mime, data: image.data}}, {type: 'text', text: prompt}] : prompt}]})});
      data = await r.json();
      text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    }
    if (!r.ok) { console.error('AI error', r.status, JSON.stringify(data).slice(0, 300)); return send(res, 502, {error: 'upstream ' + r.status}); }
    if (!text) { console.error('AI empty', JSON.stringify(data).slice(0, 400)); return send(res, 502, {error: 'empty answer'}); }
    return send(res, 200, {text});
  } catch (e) { console.error('AI exception', e && e.name, e && e.message); return send(res, 504, {error: 'upstream failed'}); }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/ai') {
    if (req.method === 'OPTIONS') return send(res, 204, '');
    if (req.method === 'POST') return handleAI(req, res);
    return send(res, 405, {error: 'POST only'});
  }
  if (url.pathname === '/api/tts') {
    if (req.method === 'POST') return handleTTS(req, res);
    if (req.method === 'GET') return send(res, 200, {on: !!GEMINI_KEY});
    return send(res, 405, {error: 'GET or POST only'});
  }
  if (url.pathname === '/api/stats') {
    if (req.method === 'POST') return handleStatsPost(req, res);
    if (req.method === 'GET') return handleStatsGet(res);
    return send(res, 405, {error: 'GET or POST only'});
  }
  if (url.pathname === '/sw.js') {
    const code = fs.readFileSync(path.join(PUBLIC, 'sw.js'), 'utf8').replace('__VERSION__', OFFLINE.version).replace('__FILES__', JSON.stringify(OFFLINE.urls));
    res.writeHead(200, {'Content-Type': MIME['.js'], 'Cache-Control': 'no-cache'});
    return res.end(code);
  }
  let file = path.normalize(path.join(PUBLIC, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
  if (!file.startsWith(PUBLIC)) return send(res, 403, {error: 'forbidden'});
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, {error: 'not found'});
    res.writeHead(200, {'Content-Type': MIME[path.extname(file)] || 'application/octet-stream'});
    res.end(buf);
  });
}).listen(PORT, () => console.log(`http://localhost:${PORT}  (AI ${KEY ? 'on: ' + PROVIDER + ', model ' + MODEL : 'OFF: set GEMINI_API_KEY'})`));
