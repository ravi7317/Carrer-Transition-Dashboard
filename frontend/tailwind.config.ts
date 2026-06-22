import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        card: "var(--card)",
        "card-soft": "var(--card-soft)",
        safe: "var(--safe)",
        hazard: "var(--hazard)",
        warn: "var(--warn)",
        toxic: "var(--toxic)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(16, 185, 129, 0.2)",
        "glow-hazard": "0 0 20px rgba(245, 158, 11, 0.2)",
        "glow-warn": "0 0 20px rgba(239, 68, 68, 0.2)",
        "glow-safe": "0 0 20px rgba(16, 185, 129, 0.3)",
      },
      animation: {
        pulseHero: "pulseHero 4s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseHero: {
          "0%": { transform: "scale(0.95)", opacity: "0.05" },
          "100%": { transform: "scale(1.05)", opacity: "0.15" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
