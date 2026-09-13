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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Degular Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'zapier-sm': '6px',
        'zapier-md': '12px',
        'zapier-pill': '9999px',
      },
    },
  },
  plugins: [],
}
