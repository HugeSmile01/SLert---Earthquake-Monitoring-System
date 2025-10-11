/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'phivolcs-blue': '#003366',
        'alert-red': '#dc2626',
        'warning-yellow': '#facc15',
        'safe-green': '#16a34a',
      },
    },
  },
  plugins: [],
}
