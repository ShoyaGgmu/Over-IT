const CACHE_NAME = 'overit-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/diary.html',
  '/settings.html',
  '/style.css',
  '/theme.js',
  '/main.js',
  '/diary.js',
  '/images/over-it-icon.png',
  '/images/house.png',
  '/images/notebook-pen.png',
  '/images/settings.png'
];

// インストール（キャッシュ保存）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// リクエストに応答（キャッシュ優先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// 古いキャッシュ削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
