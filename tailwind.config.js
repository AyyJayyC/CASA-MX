/**
 * Tailwind configuration
 * Casa MX — "Ruta Clara" Design System
 * Clay/terracotta palette with cream neutrals
 */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}", "./pages/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clay: {
          DEFAULT: '#C46A4D',   // primary accent
          400: '#C46A4D',
          500: '#B05E43',       // hover
          600: '#9A5239',       // active/darker
          700: '#8C4530',
          50: '#F2DFD7',        // light tint
          100: '#E8CCC1',
          900: '#5C2A1F',
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
          muted: '#6B6B6B',     // secondary text
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
