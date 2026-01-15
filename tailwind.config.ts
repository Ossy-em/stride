import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
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
          dark: '#1BA098', // dark mode variant
        },
        // Accent amber
        amber: {
          DEFAULT: '#F59E0B',
        },
        // Backgrounds
        bg: {
          light: '#FAFAF9',
          dark: '#1A1A1A',
          card: {
            light: '#FFFFFF',
            dark: '#242424',
          },
        },
        // Text
        text: {
          primary: {
            light: '#1F2937',
            dark: '#F3F4F6',
          },
          secondary: '#6B7280',
        },
        // Alerts
        alert: {
          coral: '#EF8275',
          error: '#DC2626',
        },
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
      },
    },
  },
  plugins: [],
}

export default config