// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: null, // We register manually in initOffline.js
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Restaurant Management System",
        short_name: "RMS",
        description: "Comprehensive Restaurant Management System",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 3000000, // 3MB limit for large chunks
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/analytics": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
