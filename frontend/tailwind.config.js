/** @type {import('tailwindcss').Config} */

// All design colours are CSS variables (space-separated RGB) defined in src/index.css,
// so a dark theme only needs to redefine the variables.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy palette, kept until every page is migrated to the UI kit.
        aicte: {
          navy: "#0F2027",
          "navy-light": "#203A43",
          teal: "#0D9488",
          "teal-light": "#14B8A6",
          accent: "#2C5364",
          surface: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0"
        },
        // Primary: deep navy/indigo. `accent` of brand is the link colour (AA on white and page).
        brand: { DEFAULT: v("brand"), hover: v("brand-hover"), soft: v("brand-soft"), accent: v("link") },
        // Accent: saffron. Use for fills, badges and icons only, with dark text on top. Never as text on white.
        accent: { DEFAULT: v("accent"), hover: v("accent-hover"), soft: v("accent-soft"), ink: v("accent-ink") },
        page: v("page"),
        surface: v("surface"),
        border: { DEFAULT: v("border"), strong: v("border-strong") },
        ink: v("ink"),
        muted: v("muted"),
        success: v("success"),
        warning: v("warning"),
        danger: v("danger"),
        info: v("info"),
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
      },
      // Type scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 (on a 16px root)
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["2rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "3.5rem" }],
      },
      // Corners: 8px controls, 12px surfaces
      borderRadius: {
        sm: "8px",
        md: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 4px 12px rgb(15 23 42 / 0.05)",
        lg: "0 2px 4px rgb(15 23 42 / 0.06), 0 12px 32px rgb(15 23 42 / 0.12)",
      },
      transitionDuration: { DEFAULT: "150ms" },
    },
  },
  plugins: [],
}
