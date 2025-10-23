// public/sw.js - Enhanced Service Worker with offline form support
const CACHE_NAME = 'vet-signup-v2'
const STATIC_CACHE_NAME = 'vet-signup-static-v2'
const FORM_QUEUE_NAME = 'offline-forms-v1'

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/profile',
  '/success',
  '/offline.html' // Fallback page
]

// Cache strategies configuration
const CACHE_STRATEGIES = {
  // Cache first, then network (for static assets)
  cacheFirst: [
    /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
    /\/icons\//,
    /nordhealth/,
    /manifest\.json$/
  ],
  
  // Network first, then cache (for API-like requests)
  networkFirst: [
    /\/api\//,
    /\/auth\//,
    /\/signup$/,
    /\/register$/
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
  console.log('Enhanced Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(PRECACHE_URLS)
      }),
      
      // Initialize form queue database
      initializeFormQueue(),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Enhanced Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return !cacheName.includes('v2') && 
                     cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== FORM_QUEUE_NAME
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      
      // Take control of all clients
      self.clients.claim(),
      
      // Process any queued forms
      processQueuedForms()
    ])
  )
})

// Initialize form queue for offline submissions
async function initializeFormQueue() {
  try {
    const cache = await caches.open(FORM_QUEUE_NAME)
    console.log('Form queue initialized')
  } catch (error) {
    console.error('Failed to initialize form queue:', error)
  }
}

// Queue form submission for offline processing
async function queueFormSubmission(request, formData) {
  try {
    const cache = await caches.open(FORM_QUEUE_NAME)
    
    // Create a unique ID for this submission
    const submissionId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store form data with metadata
    const queueEntry = {
      id: submissionId,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: formData,
      timestamp: Date.now(),
      retryCount: 0
    }
    
    // Convert to response for caching
    const response = new Response(JSON.stringify(queueEntry), {
      headers: { 'Content-Type': 'application/json' }
    })
    
    await cache.put(`/queue/${submissionId}`, response)
    
    console.log('Form submission queued:', submissionId)
    
    // Notify client that form was queued
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FORM_QUEUED',
          id: submissionId,
          message: 'Form saved offline. Will submit when connection is restored.'
        })
      })
    })
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Form saved offline. Will submit when connection is restored.',
      queueId: submissionId
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to queue form submission:', error)
    throw error
  }
}

// Process queued form submissions
async function processQueuedForms() {
  try {
    const cache = await caches.open(FORM_QUEUE_NAME)
    const requests = await cache.keys()
    
    let processedCount = 0
    let failedCount = 0
    
    for (const request of requests) {
      try {
        const response = await cache.match(request)
        if (!response) continue
        
        const queueEntry = await response.json()
        
        // Skip if too many retries
        if (queueEntry.retryCount >= 3) {
          console.log('Max retries reached for:', queueEntry.id)
          continue
        }
        
        // Try to submit the form
        const submitResponse = await fetch(queueEntry.url, {
          method: queueEntry.method,
          headers: queueEntry.headers,
          body: queueEntry.body
        })
        
        if (submitResponse.ok) {
          // Success - remove from queue
          await cache.delete(request)
          processedCount++
          
          // Notify client of successful submission
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'FORM_SUBMITTED',
                id: queueEntry.id,
                message: 'Offline form submitted successfully!'
              })
            })
          })
          
          console.log('Queued form submitted successfully:', queueEntry.id)
        } else {
          // Failed - increment retry count
          queueEntry.retryCount++
          const updatedResponse = new Response(JSON.stringify(queueEntry), {
            headers: { 'Content-Type': 'application/json' }
          })
          await cache.put(request, updatedResponse)
          failedCount++
        }
      } catch (error) {
        console.error('Failed to process queued form:', error)
        failedCount++
      }
    }
    
    if (processedCount > 0 || failedCount > 0) {
      console.log(`Processed ${processedCount} queued forms, ${failedCount} failed`)
    }
  } catch (error) {
    console.error('Failed to process form queue:', error)
  }
}

// Enhanced fetch event handler
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
  
  // Handle form submissions specially
  if (request.method === 'POST' && isFormSubmission(request)) {
    event.respondWith(handleFormSubmission(request))
    return
  }
  
  event.respondWith(handleRequest(request))
})

// Check if request is a form submission
function isFormSubmission(request) {
  const contentType = request.headers.get('content-type') || ''
  return request.method === 'POST' && (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/json')
  )
}

// Handle form submissions with offline support
async function handleFormSubmission(request) {
  try {
    // Try network first
    const response = await fetch(request.clone())
    
    if (response.ok) {
      return response
    } else {
      // Network failed, queue for later
      const formData = await request.text()
      return await queueFormSubmission(request, formData)
    }
  } catch (error) {
    // Network unavailable, queue for later
    try {
      const formData = await request.text()
      return await queueFormSubmission(request, formData)
    } catch (queueError) {
      console.error('Failed to queue form submission:', queueError)
      return new Response(JSON.stringify({
        error: 'Failed to save form offline',
        message: 'Please try again when connection is restored'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

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
    
    // Fallback to cache or offline page
    try {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Try network as last resort
      return await fetch(request)
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError)
      
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        const offlinePage = await caches.match('/offline.html')
        if (offlinePage) {
          return offlinePage
        }
        
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <title>Offline - VetSignup</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
              .offline-message { max-width: 500px; margin: 0 auto; }
              .retry-btn { background: #0066cc; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <div class="offline-message">
              <h1>You're offline</h1>
              <p>Please check your internet connection and try again. Any forms you submit will be saved and sent when your connection is restored.</p>
              <button class="retry-btn" onclick="window.location.reload()">Retry</button>
            </div>
          </body>
          </html>`,
          {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          }
        )
      }
      
      // For other requests, return a generic error response
      return new Response('Network error - content saved offline', { status: 503 })
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

// Enhanced background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'form-submission') {
    event.waitUntil(processQueuedForms())
  }
})

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'vet-signup-notification',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      },
      actions: [
        {
          action: 'explore',
          title: 'Open VetSignup',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Close notification',
          icon: '/icons/icon-96x96.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification('VetSignup', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'))
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action
    event.waitUntil(clients.openWindow('/'))
  }
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)
  
  if (event.data.type === 'PROCESS_QUEUE') {
    event.waitUntil(processQueuedForms())
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(names => 
        Promise.all(names.map(name => caches.delete(name)))
      )
    )
  }
})