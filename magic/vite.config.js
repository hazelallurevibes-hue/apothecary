import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icon.svg', 'version.json'],
      manifest: {
        name: 'Magic Sanctum — Hazel Allure',
        short_name: 'Magic 8',
        description:
          'Sanctum sphere, coin flip, argument settler, pet translator, pre-argument coach, and frustration box.',
        theme_color: '#4a1942',
        background_color: '#1a0a18',
        display: 'standalone',
        orientation: 'any',
        start_url: '/?source=pwa',
        scope: '/',
        categories: ['lifestyle', 'entertainment'],
        lang: 'en',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
        // Desktop/home-screen install — floating sphere companion
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
      },
      workbox: {
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
    }),
  ],
});
