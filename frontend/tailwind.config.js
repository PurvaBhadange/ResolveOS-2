/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        muted: '#F5F5F5',
        mutedForeground: '#525252',
        accent: '#000000',
        accentForeground: '#FFFFFF',
        border: '#000000',
        borderLight: '#E5E5E5',
        card: '#FFFFFF',
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
