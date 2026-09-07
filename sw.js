/* ==========================================================================
   INTERNSPACE OFFLINE STORAGE MANAGER (SERVICE WORKER)
   ========================================================================== */

const CACHE_NAME = 'internspace-final-v1';

// Every single file your app needs to work without any internet connection
const ASSETS_TO_CACHE = [
  './',
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

// Save files into the phone or laptop memory closet
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Clear old cache files
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept clicks and serve cached files instantly if internet drops offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) return res; // Use memory closet copy
      return fetch(e.request).then((netRes) => {
        if (!netRes || netRes.status !== 200) return netRes;
        if (e.request.method === 'GET') {
          let copy = netRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return netRes;
      }).catch(() => {
        console.log('Offline: Asset missing.');
      });
    })
  );
});