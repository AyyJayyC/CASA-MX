/**
 * Tailwind configuration
 * Country/language: UI is Spanish; styles are global.
 * Casa MX Design System - Gold-based minimalist theme
 */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}", "./pages/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FBBF24', // amber-400
          dark: '#F59E0B',    // amber-500
          darker: '#D97706',  // amber-600
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  },
  plugins: [function({ addComponents }) {
    addComponents({
      '.btn-cta': {
        '@apply px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 disabled:from-neutral-300 disabled:to-neutral-400 text-white shadow-sm transition-all disabled:cursor-not-allowed': {},
      },
      '.btn-cta-lg': {
        '@apply px-6 py-3 rounded-lg text-base font-semibold bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 disabled:from-neutral-300 disabled:to-neutral-400 text-white shadow-md transition-all disabled:cursor-not-allowed': {},
      },
    });
  }]
};
