// 人脈手札 Service Worker
// Cache-first for app shell, network-first for /api/*
const CACHE = 'renmai-v4';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Never cache API calls — always go to network
  if (url.pathname.startsWith('/api/')) return;

  // Same-origin GET only
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) {
      // Background refresh
      fetch(e.request).then((r) => {
        if (r && r.ok) caches.open(CACHE).then((c) => c.put(e.request, r.clone()));
      }).catch(() => {});
      return cached;
    }
    try {
      const r = await fetch(e.request);
      if (r && r.ok && (url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.webmanifest'))) {
        const clone = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
      }
      return r;
    } catch {
      // Offline & not cached — serve index as SPA fallback
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
      return new Response('Offline', { status: 503 });
    }
  })());
});
