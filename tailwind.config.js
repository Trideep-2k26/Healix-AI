/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'apple': ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        'hindi': ['Noto Sans Devanagari', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
      },
      colors: {
        'dark': {
          'bg': '#0f172a',
          'surface': '#1e293b',
          'elevated': '#334155',
          'text': '#f8fafc',
          'muted': '#cbd5e1',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
