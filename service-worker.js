// Service Worker for Pictogrammer PWA
const CACHE_NAME = 'pictogrammer-v42';
const urlsToCache = [
  './',
  './script.js',
  './manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Cache addAll error:', err);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const noCacheDestinations = new Set(['document', 'style', 'script']);
  if (noCacheDestinations.has(event.request.destination)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache if not successful
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request)
          .then((response) => {
            return response || new Response('Offline - resource not available');
          });
      })
  );
});

// Periodic background sync (optional - for future features)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-layouts') {
    event.waitUntil(syncLayouts());
  }
});

async function syncLayouts() {
  // Placeholder for future sync functionality
  console.log('Syncing layouts...');
}

// Push notifications (optional - for future features)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Pictogrammer';
  const options = {
    body: data.body || 'Ny besked fra Pictogrammer',
    icon: data.icon || './data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23667eea" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dominant-baseline="middle">📦</text></svg>',
    badge: './data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23667eea" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dominant-baseline="middle">📦</text></svg>',
    vibrate: [200, 100, 200],
    tag: data.tag || 'pictogrammer-notification',
    data: data.url || './',
    requireInteraction: false,
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data || './';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
