import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050506",
          900: "#0A0B0D",
          850: "#0E1014",
          800: "#13161C",
          700: "#1B1F28",
          600: "#262C38",
        },
        electric: {
          DEFAULT: "#2F6BFF",
          soft: "#6E97FF",
          dark: "#1B43B3",
        },
        lime: {
          DEFAULT: "#C8FF3D",
          soft: "#DDFF8A",
          dark: "#8FBF16",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Arial Black", "Inter", "Helvetica Neue", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(200,255,61,0.18), 0 18px 60px -20px rgba(47,107,255,0.45)",
        card: "0 24px 70px -40px rgba(0,0,0,0.9)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
