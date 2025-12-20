// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.ELECTRON ? "./" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        sw: "./public/service-worker.js",
      },
    },
  },
  publicDir: "public",
});
