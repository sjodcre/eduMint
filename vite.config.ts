import path from "path"
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    
    registerType: 'autoUpdate',
    injectRegister: 'auto',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'nftfix',
      short_name: 'nftfix',
      description: 'nftfix',
      theme_color: '#ffffff',

    },

    workbox: {
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
  server: {
    proxy : {
      "/api": {
      // target: 'https://ans-stats.decent.land',
      target: 'https://cu45.ao-testnet.xyz',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }}
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})