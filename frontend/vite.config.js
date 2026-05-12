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
      // injectManifest mode lets us own the service worker source. We need
      // this for the Background Sync API event listener (sync event fires
      // even when the page is closed and triggers our offline queue flush).
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      includeAssets: ["favicon.png", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Restaurant Management System",
        short_name: "RMS",
        description: "Comprehensive Restaurant Management System",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
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
            purpose: "any",
          },
          {
            src: "masked-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 3000000,
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
