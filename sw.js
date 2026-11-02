// Pagina merge si fara internet; PDF-urile raman disponibile dupa ce au fost deschise o data.
const CACHE = 'retete-v2';
const CORE = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET' || new URL(q.url).origin !== location.origin) return;
  // pagina: incearca intai internetul, ca modificarile sa ajunga pe tableta
  if (q.mode === 'navigate' && !/\.pdf$/i.test(new URL(q.url).pathname)) {
    e.respondWith(fetch(q).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)); } return r; }).catch(() => caches.match('./')));
    return;
  }
  if (q.headers.has('range')) return;
  e.respondWith(caches.match(q, {ignoreVary: true}).then(hit => hit || fetch(q).then(r => {
    if (r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(q, copy)); }
    return r;
  })));
});
