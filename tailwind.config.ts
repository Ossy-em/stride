import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary teal spectrum
        teal: {
          50: '#F0F9F9',
          100: '#CCF4F4',
          200: '#5DD9D8',
          500: '#0D7377',
          600: '#0A5C5F',
          700: '#0A2C2E',
          dark: '#1BA098',
        },
        // Accent amber
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
        },
        // Backgrounds
        bg: {
          light: '#FAFAF9',
          dark: '#1A1A1A',
        },
        card: {
          light: '#FFFFFF',
          dark: '#242424',
        },
        // Text colors
        'text-primary-light': '#1F2937',
        'text-primary-dark': '#F3F4F6',
        'text-secondary': '#6B7280',
        // Borders
        'border-light': '#E5E7EB',
        'border-dark': '#374151',
        // Alerts
        coral: '#EF8275',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        input: '10px',
        button: '12px',
      },
      boxShadow: {
        subtle: '0 2px 4px rgba(0, 0, 0, 0.04)',
        card: '0 4px 8px rgba(0, 0, 0, 0.06)',
        modal: '0 8px 16px rgba(0, 0, 0, 0.12)',
        glow: '0 0 6px rgba(13, 115, 119, 0.2)',
      },
      animation: {
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'fade-in': 'fade-in 300ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config