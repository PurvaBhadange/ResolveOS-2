/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#F5F0E8',
        background: '#F5F0E8',
        foreground: '#000000',
        muted: '#F0EDE6',
        mutedForeground: '#525252',
        accent: '#000000',
        accentForeground: '#F5F0E8',
        border: '#000000',
        borderLight: '#D4CEC5',
        card: '#F5F0E8',
        cardForeground: '#000000',
        ring: '#000000',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        sans: ['var(--font-source-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'pill': '9999px',
        'full': '9999px',
      },
      boxShadow: {
        'none': 'none',
        'subtle': 'none',
        'panel': 'none',
        'md': 'none',
        'lg': 'none',
        'xl': 'none',
      },
    },
  },
  plugins: [],
}
