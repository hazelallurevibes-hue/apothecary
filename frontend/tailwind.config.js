/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4a1942',
        'primary-dark': '#2d1230',
        accent: '#c9a227',
        sage: '#6b7f6a',
        cream: '#f5f0e8',
        ha: {
          plum: '#4a1942',
          'plum-dark': '#2d1230',
          gold: '#c9a227',
          sage: '#6b7f6a',
          cream: '#f5f0e8',
          moon: '#e8e4f0',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}