const CACHE_NAME = 'pochod-planner-v1.01.21';
const urlsToCache = [
  './',
  './pochod-planner.html',
  './manifest.json',
  // Leaflet CSS & JS
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  // Leaflet MarkerCluster
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
  // Chart.js
  'https://cdn.jsdelivr.net/npm/chart.js',
  // jsPDF (для генерации PDF отчетов)
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js',
  // FontAwesome (если используется для иконок)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Установка SW и кэширование
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Открыто кэш-хранилище:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Ошибка кэширования:', err))
  );
  self.skipWaiting();
});

// Активация SW и очистка старого кэша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Если сеть недоступна и ресурса нет в кэше
          if (event.request.mode === 'navigate') {
            return caches.match('./pochod-planner.html');
          }
        });
      })
  );
});