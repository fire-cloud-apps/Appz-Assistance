import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.svg'],
      manifest: {
        name: 'AppZ - Task Manager',
        short_name: 'AppZ',
        description: 'Modular productivity platform',
        theme_color: '#228be6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      external: ['iconify-icon'],
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router'
          }
          if (id.includes('node_modules/@mantine/core')) {
            return 'mantine-core'
          }
          if (id.includes('node_modules/@mantine/dates')) {
            return 'mantine-dates'
          }
          if (id.includes('node_modules/@mantine/hooks')) {
            return 'mantine-hooks'
          }
          if (id.includes('node_modules/@mantine/tiptap')) {
            return 'mantine-tiptap'
          }
          if (id.includes('node_modules/@tiptap')) {
            return 'tiptap'
          }
          if (id.includes('node_modules/@dnd-kit')) {
            return 'dnd-kit'
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query'
          }
          if (id.includes('node_modules/dexie')) {
            return 'dexie'
          }
          if (id.includes('node_modules/zustand')) {
            return 'zustand'
          }
          if (id.includes('node_modules/zod')) {
            return 'zod'
          }
        }
      }
    }
  }
})
