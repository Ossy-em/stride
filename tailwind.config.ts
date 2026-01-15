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
        teal: {
          50: '#F0F9F9',
          100: '#CCF4F4',
          200: '#5DD9D8',
          500: '#0D7377',
          600: '#0A5C5F',
          700: '#0A2C2E',
          dark: '#1BA098',
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
        },
        coral: '#EF8275',
        error: '#DC2626',
      },
    },
  },
}

export default config