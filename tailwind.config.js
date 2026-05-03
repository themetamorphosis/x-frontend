/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        gray: {
          100: "#111111",
          200: "#1A1A1A",
          300: "#222222",
          400: "#333333",
          500: "#555555",
          600: "#888888",
          700: "#AAAAAA",
        },
      },
    },
  },
  plugins: [],
};
