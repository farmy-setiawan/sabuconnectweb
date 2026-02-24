/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#03A21D',
          light: '#4BC441',
          dark: '#028A18',
          soft: '#E6F6E9',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        accent: {
          DEFAULT: '#03A21D',
          light: '#4BC441',
        },
        surface: '#FFFFFF',
        background: '#F8F9FA',
        'text-primary': '#333333',
        'text-secondary': '#64748B',
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
