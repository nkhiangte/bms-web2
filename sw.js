// This is a self-destructing service worker.
// Its purpose is to remove itself and any associated caches from browsers
// where an old, problematic version of the service worker might be "stuck".

self.addEventListener('install', (e) => {
  console.log('Installing self-destructing service worker...');
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('Activating self-destructing service worker...');
  e.waitUntil(
    self.registration.unregister()
      .then(() => {
        console.log('Service worker unregistered.');
        return self.clients.matchAll();
      })
      .then(clients => {
        console.log('Reloading clients...');
        clients.forEach(client => client.navigate(client.url));
      })
      .then(() => {
          console.log('Clearing all caches...');
          return caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            });
      })
      .then(() => {
          console.log('Self-destruction complete.');
      })
  );
});