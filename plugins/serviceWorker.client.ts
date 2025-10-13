// plugins/serviceWorker.client.ts
export default defineNuxtPlugin(() => {
  if (process.client && 'serviceWorker' in navigator) {
    // Register service worker asynchronously
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    }).then((registration) => {
      console.log('Service Worker registered:', registration.scope)

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update notification
              showUpdateNotification()
            }
          })
        }
      })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Service Worker message:', event.data)
        
        if (event.data.type === 'CACHE_UPDATED') {
          // Handle cache updates
          console.log('Cache updated for:', event.data.url)
        }
      })

      // Handle controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service worker has taken control, reload to get latest content
        window.location.reload()
      })
    }).catch((error) => {
      console.error('Service Worker registration failed:', error)
    })
  }
})

// Show update notification to user
function showUpdateNotification() {
  // Create a simple notification banner
  const banner = document.createElement('div')
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--n-color-status-info, #0066cc);
      color: white;
      padding: 12px 16px;
      text-align: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
      New version available! 
      <button onclick="window.location.reload()" style="
        background: white;
        color: var(--n-color-status-info, #0066cc);
        border: none;
        padding: 4px 12px;
        margin-left: 8px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      ">
        Refresh
      </button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 4px 12px;
        margin-left: 8px;
        border-radius: 4px;
        cursor: pointer;
      ">
        Later
      </button>
    </div>
  `
  
  document.body.appendChild(banner)
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (banner.parentElement) {
      banner.remove()
    }
  }, 10000)
}