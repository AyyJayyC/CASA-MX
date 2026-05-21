/**
 * Tailwind configuration
 * Casa MX Design System — Mexican Modernism clay palette
 */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clay: {
          50:  '#F9EBE5',
          100: '#F2D0C2',
          200: '#E4A893',
          300: '#D4886D',
          400: '#C46A4D',
          500: '#B05A3F',
          600: '#9A4A32',
          700: '#7A3A27',
          800: '#5A2A1A',
          900: '#3A1A10',
        },
        dark: {
          DEFAULT: '#1A1A18',
          muted: '#6B6B6B',
          'light-muted': '#8A8A8A',
          border: '#E8E8E6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  },
  plugins: [function({ addComponents }) {
    addComponents({
      '.btn-cta': {
        '@apply px-4 py-2 rounded-lg text-sm font-semibold bg-clay-400 hover:bg-clay-500 disabled:bg-neutral-300 text-white shadow-sm transition-all disabled:cursor-not-allowed': {},
      },
      '.btn-cta-lg': {
        '@apply px-6 py-3 rounded-lg text-base font-semibold bg-clay-400 hover:bg-clay-500 disabled:bg-neutral-300 text-white shadow-md transition-all disabled:cursor-not-allowed': {},
      },
    });
  }]
};
