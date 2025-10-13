// public/sw.js - Service Worker for caching
const CACHE_NAME = 'vet-signup-v1'
const STATIC_CACHE_NAME = 'vet-signup-static-v1'

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/profile',
  '/success',
  // Add other critical resources here
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, then network (for static assets)
  cacheFirst: [
    /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
    /\/icons\//,
    /nordhealth/
  ],
  
  // Network first, then cache (for API-like requests)
  networkFirst: [
    /\/api\//,
    /\/auth\//
  ],
  
  // Stale while revalidate (for HTML pages)
  staleWhileRevalidate: [
    /\.html$/,
    /\/$/,
    /\/profile$/,
    /\/success$/
  ]
}

// Install event - precache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(PRECACHE_URLS)
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }
  
  event.respondWith(handleRequest(request))
})

// Handle different types of requests with appropriate strategies
async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  try {
    // Determine cache strategy
    if (shouldUseCacheFirst(pathname)) {
      return await cacheFirst(request)
    } else if (shouldUseNetworkFirst(pathname)) {
      return await networkFirst(request)
    } else {
      return await staleWhileRevalidate(request)
    }
  } catch (error) {
    console.error('Request handling failed:', error)
    
    // Fallback to cache or network
    try {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      
      return await fetch(request)
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError)
      
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head>
            <title>Offline - VetSignup</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
          </body>
          </html>`,
          {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          }
        )
      }
      
      // For other requests, return a generic error response
      return new Response('Network error', { status: 503 })
    }
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }
  
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
  }
  
  return response
}

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => {
    // Ignore fetch errors, we'll return cached version
  })
  
  // Return cached version immediately if available
  if (cached) {
    return cached
  }
  
  // Otherwise wait for network
  return await fetchPromise
}

// Helper functions to determine cache strategy
function shouldUseCacheFirst(pathname) {
  return CACHE_STRATEGIES.cacheFirst.some(pattern => pattern.test(pathname))
}

function shouldUseNetworkFirst(pathname) {
  return CACHE_STRATEGIES.networkFirst.some(pattern => pattern.test(pathname))
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'offline-form-submission') {
    event.waitUntil(processOfflineSubmissions())
  }
})

// Process any offline form submissions
async function processOfflineSubmissions() {
  // This would handle any form submissions that were queued while offline
  // For this demo app, we'll just log it
  console.log('Processing offline submissions...')
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'vet-signup-notification'
    }
    
    event.waitUntil(
      self.registration.showNotification('VetSignup', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})