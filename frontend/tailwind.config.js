/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
        brand: {
          50: '#F0F4FA',
          100: '#DCE5F3',
          200: '#B8CBE6',
          300: '#8FAED4',
          400: '#4D7EB8',
          500: '#1E2B4D',
          600: '#17223D',
          700: '#11182C',
          DEFAULT: '#1E2B4D',
          hover: '#131C35',
          soft: '#F1F5F9',
          accent: '#2563EB',
        },
        accent: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          soft: '#FEF3C7',
          ink: '#92400E',
        },
        page: '#F8FAFC',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        line: '#E2E8F0',
        border: '#E2E8F0',
        'border-strong': '#CBD5E1',
        ink: '#0F172A',
        muted: '#64748B',
        // Feedback tones with soft backgrounds and text colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#0284C7',
        // Legacy aliases
        ok: '#10B981',
        warn: '#F59E0B',
        bad: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        'card-hover': '0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        dropdown: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
        modal: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
=======
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
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
    },
  },
  plugins: [],
}
