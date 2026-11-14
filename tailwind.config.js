/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        ca: {
          red: '#C7000B',
          'red-dark': '#A50009',
          navy: '#1B2B4B',
          gold: '#C9A063',
          blue: '#4A6FA5',
          'blue-light': '#8FA8C8',
          bg: '#F5F7FA',
        },
      },
    },
  },
  plugins: [],
}