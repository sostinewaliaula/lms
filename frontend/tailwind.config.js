/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#ffffff',
          dark: '#f9fafb',
          card: '#ffffff',
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
          primary: '#111827',
          secondary: '#374151',
          muted: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
