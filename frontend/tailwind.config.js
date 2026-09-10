/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#060913',
          850: '#0a0f24',
          800: '#0f172a',
          750: '#15203b',
          700: '#1e293b',
          600: '#334155',
        },
        isro: {
          orange: '#ff9933',
          blue: '#138808',
          cyan: '#00d2ff',
          deep: '#0052cc'
        }
      }
    },
  },
  plugins: [],
}
