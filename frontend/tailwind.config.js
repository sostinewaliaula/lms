/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#1a1f3a',
          dark: '#1e2440',
          card: '#252b4a',
        },
        primary: {
          DEFAULT: '#10b981',
          light: '#22c55e',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          light: '#a855f7',
          dark: '#7c3aed',
        },
        text: {
          primary: '#ffffff',
          secondary: '#f3f4f6',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
}


