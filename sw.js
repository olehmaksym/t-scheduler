const cacheName = 'ts-v1';
const appFiles = [
  '/',
  'index.html',
  'app.js',
  'style.css'
];

self.addEventListener('install', e => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(appFiles))
  );
});

self.addEventListener('fetch', e => {
  console.log('[Service Worker] Fetched resource '+e.request.url);
  e.respondWith(caches.match(e.request)
    .then(cachedResponse => cachedResponse || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if(cacheName.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
