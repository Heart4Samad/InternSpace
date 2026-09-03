const CACHE_NAME = 'internspace-cache-v1';

const ASSETS_TO_CACHE = [
  './index.html',
  './register.html',
  './dashboard.html',
  './kanban.html',
  './style.css',
  './script.js',
  './manifest.json',
  './audio/auth_ambient.mp3',
  './audio/lamp_hum.mp3',
  './audio/switch_click.mp3',
  './audio/power_up.mp3',
  './audio/workspace_beat.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: System files securely cached for offline execution.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Clearing outdated system cache layers.');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        console.log('SW: Asset could not be fetched. Device is fully offline.');
      });
    })
  );
});
