import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const auth0Domain = env.VITE_AUTH0_DOMAIN || env.AUTH0_DOMAIN || ''
  const auth0ClientId = env.VITE_AUTH0_CLIENT_ID || env.AUTH0_CLIENT_ID || ''
  const auth0Enabled =
    env.VITE_AUTH0_ENABLED === 'true' ||
    (auth0Domain && auth0ClientId && env.VITE_AUTH0_ENABLED !== 'false')
  const appUrl = (env.VITE_APP_URL || 'https://apothecary.hazelallure.com').replace(/\/$/, '')

  return {
  plugins: [react()],
  envPrefix: ['VITE_', 'AUTH0_'],
  define: {
    'import.meta.env.VITE_APP_URL': JSON.stringify(appUrl),
    'import.meta.env.VITE_AUTH0_DOMAIN': JSON.stringify(auth0Domain),
    'import.meta.env.VITE_AUTH0_CLIENT_ID': JSON.stringify(auth0ClientId),
    'import.meta.env.VITE_AUTH0_ENABLED': JSON.stringify(auth0Enabled ? 'true' : 'false'),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        bypass(req) {
          if (req.url?.startsWith('/api/auth/callback')) return req.url;
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@sentry')) return 'sentry'
          if (id.includes('@auth0')) return 'auth0'
          if (id.includes('@supabase')) return 'supabase'
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/react/')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
}})