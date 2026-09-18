/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mindora: {
          navy: '#0f172a',
          blue: '#1e3a8a',
          accent: '#2563eb',
          green: '#10b981',
          emerald: '#059669',
          light: '#f8fafc',
          dark: '#020617'
        }
      }
    },
  },
  plugins: [],
}
