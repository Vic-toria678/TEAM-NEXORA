import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1112",
        surface: "#111a1b",
        mint: "#b8f28b",
        aqua: "#83ded0",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 70px rgba(131, 222, 208, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
