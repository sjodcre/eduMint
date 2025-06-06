import path from "path"
import fs from 'fs';
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
    manifest: false,
    // manifest: {
    //   name: 'nftfix',
    //   short_name: 'nftfix',
    //   description: 'nftfix',
    //   theme_color: '#ffffff',

    // },

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
  // server: {
  //   host: '0.0.0.0',  // Allows connections from local network
  //   port: 5173,
  //   strictPort: true, // Ensures consistent port usage
  //   cors: true,  // Allow cross-origin requests during development
  //   https: {
  //     key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
  //     cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem'))
  //   },
  // },
  // server: {
  //   // host: '0.0.0.0', // Allow access from external devices
  //   // port: 5173,
  //   // https: {
  //   //   key: fs.readFileSync('./key.pem'),
  //   //   cert: fs.readFileSync('./cert.pem'),
  //   // },
  //   proxy : {
  //     "/api": {
  //     // target: 'https://ans-stats.decent.land',
  //     target: 'https://cu45.ao-testnet.xyz',
  //     changeOrigin: true,
  //     rewrite: (path) => path.replace(/^\/api/, '')
  //   }}
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})