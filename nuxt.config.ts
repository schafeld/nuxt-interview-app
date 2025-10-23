// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  compatibilityDate: '2025-09-08',
  
  // SEO and accessibility configuration
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      title: 'VetSignup - Veterinary Product Registration',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Professional veterinary product registration platform using NordHealth Design System' },
        { name: 'theme-color', content: '#0066cc' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'VetSignup' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/icons/icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/icon-192x192.png' }
      ]
    }
  },
  
  typescript: {
    strict: true,
    typeCheck: false
  },
  css: [
    '@nordhealth/css', 
    '@nordhealth/themes/lib/vet.css',
    '@nordhealth/icons',
    '~/assets/css/mobile-enhancements.css'
  ],
  plugins: ['~/plugins/nordhealth.client.ts'],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('nord-')
    }
  },
  runtimeConfig: {
    public: {
      passwordConfig: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        minSpecialChars: 2
      }
    }
  },

  // Security headers and PWA configuration
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          // Content Security Policy for enhanced security
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: 'unsafe-eval' needed for Nuxt dev mode
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' ws: wss:",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'"
          ].join('; '),
          
          // Security headers
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()'
          ].join(', '),
          
          // Cache control for static assets
          'Cache-Control': 'public, max-age=3600',
          
          // HTTPS enforcement (production only)
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        }
      },
      
      // Service worker specific headers
      '/sw.js': {
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Service-Worker-Allowed': '/'
        }
      },
      
      // Manifest specific headers
      '/manifest.json': {
        headers: {
          'Content-Type': 'application/manifest+json',
          'Cache-Control': 'public, max-age=86400'
        }
      }
    }
  }
})