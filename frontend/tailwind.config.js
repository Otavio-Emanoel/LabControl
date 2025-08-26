/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F41BB',
          light: '#1F41BB',
          dark: '#1F41BB',
        },
        danger: '#B00020',
        warning: '#FFC107',
        success: '#4CAF50',
        info: '#2196F3',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        madimi: ['"Madimi One"', 'cursive'],
      },
    },
  },
  plugins: [],
};
