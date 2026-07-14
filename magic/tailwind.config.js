/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sanctum: {
          ink: '#120510',
          plum: '#4a1942',
          deep: '#2d0f2a',
          violet: '#6b2d7a',
          gold: '#d4af37',
          'gold-soft': '#e8c547',
          mist: '#f7f1e8',
          rose: '#b76e79',
          moon: '#e8e0f0',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sanctum: '0 8px 32px rgba(45, 15, 42, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.08)',
        glow: '0 0 40px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
};
