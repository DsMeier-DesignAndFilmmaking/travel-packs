/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'air-black': '#222222',
          'air-gray': '#717171',
          'air-border': '#ebebeb',
          'air-bg': '#ffffff',
          'air-accent': '#FF385C',
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }