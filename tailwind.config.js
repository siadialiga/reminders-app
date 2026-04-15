/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        // macOS-like grays
        apple: {
          50:  '#f9f9fb',
          100: '#f2f2f7',
          200: '#e5e5ea',
          300: '#d1d1d6',
          400: '#aeaeb2',
          500: '#8e8e93',
          600: '#636366',
          700: '#48484a',
          800: '#3a3a3c',
          900: '#2c2c2e',
          950: '#1c1c1e',
        },
      },
      animation: {
        'in': 'fade-in 0.15s ease-out both',
      },
    },
  },
  plugins: [],
};
