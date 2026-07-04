import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/restaurant-app-ciee/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CIEE Korea Food Guide',
        short_name: 'Food Guide',
        description: 'A curated guide to restaurants near your CIEE housing in Korea',
        theme_color: '#8A3F26',
        background_color: '#F4E6D8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/restaurant-app-ciee/',
        icons: [
          { src: '/restaurant-app-ciee/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/restaurant-app-ciee/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/restaurant-app-ciee/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})