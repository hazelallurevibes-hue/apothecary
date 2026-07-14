import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('node_modules/react/')) {
              return 'vendor-react';
            }
          }
          if (id.includes('data/generated/packs')) return 'content-packs';
          if (id.includes('data/generated/fortunes')) return 'content-fortunes';
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icon.svg', 'version.json'],
      manifest: {
        name: 'Magic Sanctum — Hazel Allure',
        short_name: 'Magic Sanctum',
        description:
          'Sanctum sphere, heaven & ember coin, Hearth Court, Familiar Whisperer, Before the Storm. Entertainment only.',
        theme_color: '#4a1942',
        background_color: '#120510',
        display: 'standalone',
        orientation: 'any',
        start_url: '/?source=pwa',
        scope: '/',
        categories: ['lifestyle', 'entertainment'],
        lang: 'en',
        id: 'https://magic.hazelallure.com/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        shortcuts: [
          {
            name: 'Sanctum Sphere',
            short_name: 'Sphere',
            url: '/?source=shortcut-sphere',
            description: 'Ask the free sanctum sphere',
          },
          {
            name: 'Hearth Court',
            short_name: 'Court',
            url: '/hearth-court?source=shortcut',
            description: 'Playful multi-side rulings',
          },
        ],
      },
      workbox: {
        // Fortune + content libraries exceed default 2 MiB precache limit
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/version\.json$/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 32, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
      chunkSizeWarningLimit: 2500,
    }),
  ],
});
