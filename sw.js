/**
 * Service Worker for Number System Converter PWA
 * Handles caching and offline functionality
 */

const CACHE_NAME = 'number-converter-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/js/converter.js',
    '/js/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Maximum number of dynamic cache entries
const MAX_DYNAMIC_CACHE_SIZE = 50;

/**
 * Install event - cache static files
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Pre-caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error during service worker installation:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('Error during service worker activation:', error);
            })
    );
});

/**
 * Fetch event - serve from cache with network fallback
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if response is valid
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Add to dynamic cache
                        caches.open(DYNAMIC_CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                                limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE);
                            })
                            .catch((error) => {
                                console.error('Error caching dynamic content:', error);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed, try to return a fallback
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // For other requests, you could return a generic offline page or image
                        return new Response(
                            'Offline - This resource is not available',
                            {
                                status: 408,
                                headers: { 'Content-Type': 'text/plain' }
                            }
                        );
                    });
            })
    );
});

/**
 * Background sync for future enhancement
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * Push notification handler for future enhancement
 */
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Open App',
                    icon: '/icons/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icons/icon-192x192.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                clearAllCaches()
                    .then(() => event.ports[0].postMessage({ success: true }))
                    .catch((error) => event.ports[0].postMessage({ error: error.message }));
                break;
        }
    }
});

/**
 * Limit the size of a cache
 * @param {string} cacheName - Name of the cache to limit
 * @param {number} maxSize - Maximum number of entries
 */
function limitCacheSize(cacheName, maxSize) {
    caches.open(cacheName)
        .then((cache) => {
            return cache.keys();
        })
        .then((keys) => {
            if (keys.length > maxSize) {
                return cache.delete(keys[0])
                    .then(() => limitCacheSize(cacheName, maxSize));
            }
        })
        .catch((error) => {
            console.error('Error limiting cache size:', error);
        });
}

/**
 * Clear all caches
 * @returns {Promise} Promise that resolves when all caches are cleared
 */
function clearAllCaches() {
    return caches.keys()
        .then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        });
}

/**
 * Background sync function (placeholder for future enhancement)
 */
function doBackgroundSync() {
    return new Promise((resolve) => {
        console.log('Background sync triggered');
        // Could sync offline actions, analytics, etc.
        resolve();
    });
}

/**
 * Handle periodic background sync (if supported)
 */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(doPeriodicSync());
    }
});

/**
 * Periodic sync function (placeholder for future enhancement)
 */
function doPeriodicSync() {
    return new Promise((resolve) => {
        console.log('Periodic sync triggered');
        // Could check for updates, sync data, etc.
        resolve();
    });
}