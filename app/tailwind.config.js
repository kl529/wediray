/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Y2K 다이어리 팔레트
        pink: { 400: '#FF69B4', 500: '#FF1493' },
        lime: { 400: '#CCFF00', 500: '#AAEE00' },
        sky: { 400: '#00CFFF', 500: '#00AADD' },
      },
    },
  },
  plugins: [],
};


