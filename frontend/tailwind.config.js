/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff6b35",
          dim: "#fff4ef",
          hover: "#e85d2a",
          dark: "#e85d2a",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        "codeket-rms": {
          // Brand identity from product-site palette
          primary: "#ff6b35", // Brand Orange — Main buttons, active states, highlights
          "primary-content": "#ffffff", // White text on orange (High contrast)
          secondary: "#4b5563", // Slate Grey — Secondary actions, subtle UI (Premium feel)
          "secondary-content": "#ffffff",
          accent: "#e85d2a", // Darker Orange — Hover states, accents
          "accent-content": "#ffffff",
          neutral: "#1a1a1a", // Deep Charcoal — Sidebar/navbar, heavy contrast
          "neutral-content": "#ffffff",
          "base-100": "#ffffff", // Main background — Crisp White
          "base-200": "#f9fafb", // Cool Grey-50 — Subtle background differentiation (SaaS standard)
          "base-300": "#f3f4f6", // Cool Grey-100 — Borders, dividers
          "base-content": "#1a1a1a", // Primary text on base
          info: "#3b82f6", // Blue
          "info-content": "#ffffff",
          success: "#22c55e", // Green
          "success-content": "#ffffff",
          warning: "#f59e0b", // Amber
          "warning-content": "#ffffff",
          error: "#ef4444", // Red
          "error-content": "#ffffff",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.97",
          "--tab-radius": "0.5rem",
        },
      },
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
      // {
      //   forest: {
      //     primary: "#4CAF50",
      //     secondary: "#8BC34A",
      //     accent: "#CDDC39",
      //     neutral: "#F5F5F5",
      //     "base-100": "#FFFFFF",
      //     info: "#2196F3",
      //     success: "#4CAF50",
      //     warning: "#FF9800",
      //     error: "#F44336",
      //   },
      //   ocean: {
      //     primary: "#2196F3",
      //     secondary: "#03A9F4",
      //     accent: "#00BCD4",
      //     neutral: "#F5F5F5",
      //     "base-100": "#FFFFFF",
      //     info: "#2196F3",
      //     success: "#4CAF50",
      //     warning: "#FF9800",
      //     error: "#F44336",
      //   },
      //   corporate: {
      //     primary: "#2196F3",
      //     secondary: "#03A9F4",
      //     accent: "#00BCD4",
      //     neutral: "#F5F5F5",
      //     "base-100": "#DCCCBB",
      //     "base-200": "#EAB464",
      //     "base-300": "#A7754D",
      //     info: "#2196F3",
      //     success: "#4CAF50",
      //     warning: "#FF9800",
      //     error: "#F44336",
      //   },
      // },
    ],
  },
};
