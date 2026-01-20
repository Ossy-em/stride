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
        // Updated teal spectrum (+brightness)
        teal: {
          50: '#F0FDFC',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6', // Main teal (brighter)
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          dark: '#22D3BE', // Dark mode variant
        },
        // Updated amber (brighter)
        amber: {
          DEFAULT: '#FBBF24',
          light: '#FDE68A',
          dark: '#F59E0B',
        },
        coral: '#F87171',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        input: '12px',
        button: '12px',
        pill: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(20, 184, 166, 0.03)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.07), 0 15px 40px rgba(20, 184, 166, 0.08)',
        modal: '0 20px 40px rgba(0, 0, 0, 0.15)',
        glow: '0 0 20px rgba(20, 184, 166, 0.3)',
      },
      animation: {
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'fade-in': 'fade-in 400ms ease-out',
        'slide-up': 'slide-up 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.95' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config