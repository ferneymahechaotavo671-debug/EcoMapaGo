import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Content-Security-Policy (punto 18): le dice al navegador de dónde puede cargar scripts,
// estilos, imágenes y conexiones. Si alguien lograra inyectar un <script> ajeno (XSS),
// el navegador se negaría a ejecutarlo. Solo se inyecta en el build de producción.
function politicaCSP(apiUrl) {
  let apiOrigen = 'http://localhost:5000'
  try { apiOrigen = new URL(apiUrl).origin } catch { /* se usa el valor por defecto */ }
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigen} https://nominatim.openstreetmap.org`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000'

  return {
  plugins: [
    react(),
    {
      name: 'inyectar-csp-y-metadatos',
      transformIndexHtml(html) {
        if (command !== 'build') return html
        const meta = `<meta http-equiv="Content-Security-Policy" content="${politicaCSP(apiUrl)}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`
        return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${meta}`)
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      manifest: {
        name: 'EcoMapaGo',
        short_name: 'EcoMapaGo',
        description: 'Reporta y consulta problemas ambientales en tu localidad',
        theme_color: '#1b5e20',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'balanced-integrity-production-1b25.up.railway.app'
    ]
  }
  }
})
