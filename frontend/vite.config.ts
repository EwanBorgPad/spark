import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from 'vite-plugin-pwa'

import path from "path"

const root = path.resolve(__dirname, "src")
const publicDir = path.resolve(__dirname, "public")

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      "@": path.resolve(root),
      shared: path.resolve(__dirname, "shared"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Spark-it',
        short_name: 'Spark-it',
        description: 'Make your idea become real',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Set to 10 MB
      },
    }),
  ],
  publicDir: publicDir,
  // enable below to serve on local network (for testing on mobile devices)
  // server: {
  //   host: true,
  // }
})
