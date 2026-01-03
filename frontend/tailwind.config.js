/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          background: '#0F0F0F', // Deep dark background from StreamX
          primary: '#6366f1',    // Fallback purple
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        // This allows us to use "bg-white/5" for glass effects
        backdropBlur: {
          xs: '2px',
        },
      },
    },
    plugins: [],
  }