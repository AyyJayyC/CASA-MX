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
  plugins: []
};
