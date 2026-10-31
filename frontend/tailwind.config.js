/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1F3A5F', hover: '#16304F', soft: '#EEF2F7' },
        accent: '#0B6E99',
        page: '#F5F6F8',
        line: '#D9DEE5',
        ink: '#1A202C',
        muted: '#5A6472',
        ok: '#2F7D4F', warn: '#A36A00', bad: '#B42318', info: '#0B6E99',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
      borderRadius: { sm: '4px', md: '6px' },
    },
  },
  plugins: [],
}
