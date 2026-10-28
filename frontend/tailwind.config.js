/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aicte: {
          navy: "#0F2027",
          "navy-light": "#203A43",
          teal: "#0D9488",
          "teal-light": "#14B8A6",
          accent: "#2C5364",
          surface: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0"
        }
      }
    },
  },
  plugins: [],
}
