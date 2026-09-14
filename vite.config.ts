import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Lector Bíblico - Estudio con Comentarios',
        short_name: 'Biblia',
        description: 'Aplicación de lectura bíblica offline con múltiples versiones y comentarios',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Excluir biblia.db del precache ya que es muy grande
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}'],
        // Usar runtime caching para la base de datos
        runtimeCaching: [
          {
            urlPattern: /\/biblia\.db$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-db-cache',
              expiration: {
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
