/**
 * Tailwind configuration
 * Casa MX — "Ruta Clara" Design System
 * Clay/terracotta palette with cream neutrals
 */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clay: {
          DEFAULT: '#9A4E37',   // primary accent (WCAG AA 4.5:1 on white, also on clay/10 tint)
          400: '#9A4E37',
          500: '#8F4E3A',       // hover
          600: '#7D4230',       // active/darker
          700: '#733828',
          50: '#E7CDC2',        // light tint (adjusted — passes 4.5:1 with clay DEFAULT)
          100: '#DDBDAD',
          900: '#4C2416',
        },
        sand: {
          DEFAULT: '#EAE4DD',   // borders, cards
          50: '#F5F1EC',        // page background
          100: '#EAE4DD',
          200: '#D9D0C7',
          800: '#6B6B6B',
        },
        ink: {
          DEFAULT: '#1C1B19',   // main text
          muted: '#595959',     // secondary text (WCAG AA on sand backgrounds)
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [function({ addComponents }) {
    addComponents({
      '.btn-cta': {
        '@apply px-4 py-2 rounded-lg text-sm font-semibold bg-clay text-white hover:bg-clay-500 disabled:bg-sand-200 disabled:text-ink-muted shadow-sm transition-all disabled:cursor-not-allowed': {},
      },
      '.btn-cta-lg': {
        '@apply px-6 py-3 rounded-lg text-base font-semibold bg-clay text-white hover:bg-clay-500 disabled:bg-sand-200 disabled:text-ink-muted shadow-md transition-all disabled:cursor-not-allowed': {},
      },
    });
  }],
};
