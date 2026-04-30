import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Wishifyy - Wishlist Couple',
        short_name: 'Wishifyy',
        description: 'Lưu những điều mơ ước cùng nhau',
        theme_color: '#c2185b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split Firebase into sub-packages for better caching
            if (id.includes('firebase/auth')) return 'firebase-auth';
            if (id.includes('firebase/firestore')) return 'firebase-firestore';
            if (id.includes('firebase/messaging')) return 'firebase-messaging';
            if (id.includes('firebase')) return 'firebase-core';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  server: {
    host: true, // thay vì [IP_ADDRESS]
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@context': '/src/context',
      '@api': '/src/api',
      '@config': '/src/config',
      '@utils': '/src/utils',
      '@constants': '/src/constants',
      '@pages': '/src/pages',
    }
  }
})