// Service Worker for Philippine CRM
// Provides caching, offline support, and performance optimizations

const CACHE_NAME = 'philippine-crm-v1'
const STATIC_CACHE = 'philippine-crm-static-v1'
const DATA_CACHE = 'philippine-crm-data-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/leads',
  '/companies',
  '/deals',
  '/manifest.json',
  // Add other critical assets
]

// API endpoints to cache
const DATA_URLS = [
  '/api/',
  'https://tbgmweiszhsnsaarswvf.supabase.co'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      // Cache data
      caches.open(DATA_CACHE).then((cache) => {
        console.log('Service Worker: Data cache ready')
        return cache
      })
    ]).then(() => {
      // Force activation of new service worker
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DATA_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Take control of all pages
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return
  }

  // Handle API requests with network-first strategy
  if (isDataRequest(request.url)) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Handle pages with stale-while-revalidate strategy
  event.respondWith(staleWhileRevalidateStrategy(request))
})

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache-first strategy failed:', error)
    return new Response('Offline - content not available', { status: 503 })
  }
}

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Offline - no cached data available',
        offline: true 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Stale-while-revalidate strategy (for pages)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  // Return cached version immediately if available
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Return cached version if network fails and no cached version was returned
    return cachedResponse || new Response('Offline', { status: 503 })
  })

  return cachedResponse || fetchPromise
}

// Helper functions
function isDataRequest(url) {
  return DATA_URLS.some(dataUrl => url.includes(dataUrl))
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url)
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'sync-crm-data') {
    event.waitUntil(syncCRMData())
  }
})

async function syncCRMData() {
  try {
    // Get pending offline actions from IndexedDB
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        // Remove successful action from pending queue
        await removePendingAction(action.id)
      } catch (error) {
        console.error('Sync failed for action:', action, error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'crm-notification',
    data: data.data,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action) {
    // Handle notification action buttons
    handleNotificationAction(event.action, event.notification.data)
  } else {
    // Open the app
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

function handleNotificationAction(action, data) {
  switch (action) {
    case 'view-lead':
      clients.openWindow(`/leads/${data.leadId}`)
      break
    case 'view-deal':
      clients.openWindow(`/deals/${data.dealId}`)
      break
    default:
      clients.openWindow('/dashboard')
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingActions() {
  // Implementation would use IndexedDB to store offline actions
  return []
}

async function removePendingAction(id) {
  // Implementation would remove action from IndexedDB
  console.log('Removing pending action:', id)
}