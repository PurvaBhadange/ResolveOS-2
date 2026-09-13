/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#fffefb',
        'canvas-soft': '#f8f4f0',
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
        primary: {
          DEFAULT: '#ff4f00',
          hover: '#e54700',
          active: '#cc3f00',
        },
        'on-primary': '#fffefb',
        // Semantic helper tones
        accent: {
          amber: '#d97706',
          rose: '#e11d48',
          emerald: '#059669',
          indigo: '#4f46e5',
        }
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Degular Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 2px 8px -2px rgba(32, 21, 21, 0.04), 0 1px 4px -1px rgba(32, 21, 21, 0.02)',
        'modal': '0 20px 25px -5px rgba(32, 21, 21, 0.1), 0 10px 10px -5px rgba(32, 21, 21, 0.04)',
      },
    },
  },
  plugins: [],
};
