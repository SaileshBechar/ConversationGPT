/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx", 'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    require('flowbite/plugin')
  ],
  darkMode: 'class',
}
