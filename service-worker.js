const CACHE_NAME = 'exutoire-cache-v1';
const FILES_TO_CACHE = [
  './',
  './Accueil.html',
    './journal.html',
  './dnd.html',
  './setting.html',
  './style.css',
  './app.js',
  './service-worker.js',
    './app_merged.js',
'.app_clean.js',
  './manifest.json',
  './dé20.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('./Accueil.html')) // fallback offline
  );
});
