/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        military: '#4A5D23',
        finance: '#1E3D59',
        gold: '#D4AF37',
        danger: '#C1292E',
        dark: {
          DEFAULT: '#1a2639',
          card: '#2c3e50',
        },
      },
      fontFamily: {
        military: ['Impact', 'Arial Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
