/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F41BB',   // roxo principal
          light: '#1F41BB',
          dark: '#1F41BB',
        },
        secondary: {
          DEFAULT: '#03DAC6',   // verde água
          light: '#66FFF9',
          dark: '#00A896',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#121212',
        },
        surface: {
          DEFAULT: '#F5F5F5',
          dark: '#1E1E1E',
        },
        text: {
          primary: '#000000',
          secondary: '#666666',
          inverse: '#FFFFFF',
          muted: '#A1A1AA',
        },
        border: {
          DEFAULT: '#E5E5E5',
        },
        danger: '#B00020',
        warning: '#FFC107',
        success: '#4CAF50',
        info: '#2196F3',
      },
    },
  },
  plugins: [],
};
