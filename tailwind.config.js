/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hkd: {
          black: "#141212",
          charcoal: "#211d1d",
          panel: "#2a2424",
          pink: "#e8285c",
          "pink-dark": "#c11a49",
          yellow: "#f5c518",
          green: "#3fae44",
          cream: "#f6ede4"
        }
      },
      fontFamily: {
        display: ["'Anton'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        urdu: ["'Noto Nastaliq Urdu'", "serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        card: "0 4px 14px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};
