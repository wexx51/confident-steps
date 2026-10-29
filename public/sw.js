'use strict';
/*
 * Offline support. The server fills in VERSION (a hash of the site files) and FILES (every file in public/),
 * so a new deploy always installs a fresh cache and removes the old one.
 * Pages and files come from the network first, so an online visitor always gets the current version;
 * if the network is missing or too slow, the saved copy is used. AI requests are never cached.
 */
const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = 'uverenny-shag-' + VERSION;
const WAIT = 4000;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('uverenny-shag-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith(fromNetwork(req).catch(() => fromCache(req)));
});
function fromNetwork(req) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(reject, WAIT);
    fetch(req).then(res => {
      clearTimeout(timer);
      if (!res.ok) return reject();
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req.mode === 'navigate' ? '/' : req, copy));
      resolve(res);
    }, () => { clearTimeout(timer); reject(); });
  });
}
async function fromCache(req) {
  const hit = await caches.match(req.mode === 'navigate' ? '/' : req, {ignoreSearch: true});
  return hit || (await caches.match('/', {ignoreSearch: true})) || Response.error();
}
