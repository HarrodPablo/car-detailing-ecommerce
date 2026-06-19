/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8B0000',
          hover: '#A00000'
        },
        dark: {
          base: '#0A0A0A',
          card: '#111111',
          border: '#2D2D2D',
          900: '#1a1a1a',
          950: '#0A0A0A'
        }
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
