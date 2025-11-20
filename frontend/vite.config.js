// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.ELECTRON ? "./" : "/",
  plugins: [react()],
  server: {
    port: 5182, //
    open: true,
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
