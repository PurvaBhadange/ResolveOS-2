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
        foreground: '#18181B',
        muted: '#F4F4F5',
        mutedForeground: '#71717A',
        accent: '#18181B',
        accentForeground: '#FFFFFF',
        border: '#E4E4E7',
        borderDark: '#27272A',
        card: '#FFFFFF',
        cardForeground: '#18181B',
        ring: '#18181B',
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
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'panel': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
