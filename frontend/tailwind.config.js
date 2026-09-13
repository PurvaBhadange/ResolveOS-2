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
        muted: '#F8FAFC',
        mutedForeground: '#64748B',
        border: '#E2E8F0',
        card: '#FFFFFF',
        cardForeground: '#18181B',
        ring: '#18181B',
        // Curated Light Pastel Palette
        pastel: {
          sage: { DEFAULT: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
          lavender: { DEFAULT: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6' },
          peach: { DEFAULT: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
          rose: { DEFAULT: '#FFF1F2', border: '#FECDD3', text: '#9F1239' },
          sky: { DEFAULT: '#F0F9FF', border: '#BAE6FD', text: '#0369A1' },
          sand: { DEFAULT: '#FDFCFB', border: '#E7E5E4', text: '#44403C' },
        },
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
