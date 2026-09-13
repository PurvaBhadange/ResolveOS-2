/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zapier: {
          primary: '#ff4f00',
          'primary-hover': '#e04500',
          'on-primary': '#fffefb',
          ink: '#201515',
          'ink-soft': '#2f2a26',
          'ink-mid': '#36342e',
          body: '#605d52',
          'body-mid': '#939084',
          mute: '#c5c0b1',
          canvas: '#fffefb',
          'canvas-soft': '#f8f4f0',
        },
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
        }
      },
      borderRadius: {
        zapier: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
