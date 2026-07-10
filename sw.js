// Service Worker de El Sacamuelas — hace el juego instalable y jugable offline.
// Sube CACHE_VERSION cada vez que cambien los archivos para forzar la actualización.
const CACHE_VERSION = 'sacamuelas-v1';

// Archivos que se precargan al instalar (todo lo necesario para jugar offline).
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './iconos/logo.png',
  './iconos/icon-192.png',
  './iconos/icon-512.png',
  './iconos/icon-maskable-512.png',
  './CD1_-_Cirugia.mp3',
  './CD1_-_Extraccion.mp3',
  './CD1_-_Sangrado.mp3',
  './CD1_-_Urgencia.mp3',
];

// Instalar: precachear los assets del juego.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // addAll falla si un solo archivo falla; usamos add individual tolerante
      Promise.all(PRECACHE.map((url) =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
      ))
    ).then(() => self.skipWaiting())
  );
});

// Activar: borrar caches viejos de versiones anteriores.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch:
//  - Las llamadas a la API del ranking (/api/...) SIEMPRE van a la red (nunca cache).
//  - El resto: cache-first, con respaldo a la red y guardado en cache.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // El ranking necesita datos frescos y no debe cachearse.
  if (url.pathname.includes('/api/')) {
    event.respondWith(fetch(req).catch(() => new Response('{"scores":[]}', {
      headers: { 'Content-Type': 'application/json' },
    })));
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Guardar en cache las respuestas válidas del mismo origen.
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Si se pide una página y no hay red, servir el index cacheado.
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
