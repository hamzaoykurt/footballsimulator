/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wc26: {
            black: '#101820', // Official Brand Black
            white: '#FFFFFF',
            green: '#00B140', // Mexico/Field Green
            blue: '#0033A0',  // USA/France Blue
            red: '#DA291C',   // Canada Red
            gold: '#C8102E',  // Just a vibrant red actually, let's use a nice accent
            dark: '#1e293b',
            light: '#f8fafc',
        },
        football: {
          grass: '#059669', 
          accent: '#2563EB', 
          text: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'], // Add display font if available or stick to Inter
      },
      backgroundImage: {
        'wc-pattern': "url('https://www.transparenttextures.com/patterns/cubes.png')", // Placeholder pattern
        'hero-gradient': 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        'card-gradient': 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
