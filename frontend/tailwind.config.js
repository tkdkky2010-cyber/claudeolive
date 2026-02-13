/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2C7A3F',
          hover: '#246731',
        },
        secondary: '#FF6B35',
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#666666',
        },
        border: '#E0E0E0',
        background: '#F8F8F8',
        error: '#E53935',
        link: '#5C6AC4',
        disclaimer: '#FFF9E6',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
      },
    },
  },
  plugins: [],
}
