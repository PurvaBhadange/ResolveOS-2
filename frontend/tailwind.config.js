/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zapier-Inspired Warm Coffee & Saturated Orange Palette
        primary: {
          DEFAULT: '#ff4f00',
          hover: '#e04500',
          light: '#fff2ec',
        },
        'on-primary': '#fffefb',
        ink: {
          DEFAULT: '#201515',
          soft: '#2f2a26',
          mid: '#36342e',
        },
        body: {
          DEFAULT: '#605d52',
          mid: '#939084',
        },
        mute: '#c5c0b1',
        canvas: {
          DEFAULT: '#fffefb',
          soft: '#f8f4f0',
        },
        // Legacy tealbrand for backward compat
        tealbrand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#0d3331',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}
