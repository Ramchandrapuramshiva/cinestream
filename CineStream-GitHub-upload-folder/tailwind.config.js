/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        cine: {
          red: "#e50914",
          black: "#050505",
          panel: "#111113",
          muted: "#9ca3af"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(229, 9, 20, 0.24)"
      }
    }
  },
  plugins: []
};
