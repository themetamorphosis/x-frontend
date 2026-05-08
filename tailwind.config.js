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
        bg: "#F5F5F5",
        surface: "#FFFFFF",
        border: "#EBEBEB",
        text: "#111111",
        "text-secondary": "#888888",
        "text-tertiary": "#AAAAAA",
        primary: "#111111",
        "primary-text": "#FFFFFF",
        error: "#E53935",
        "dark-bg": "#000000",
        "dark-surface": "#1C1C1E",
        "dark-border": "#2C2C2E",
        "dark-text": "#FFFFFF",
        "dark-primary": "#FFFFFF",
        "dark-primary-text": "#000000",
        "dark-text-secondary": "#888888",
        "dark-text-tertiary": "#555555",
        "dark-error": "#FF453A",
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
        "inter-extrabold": ["Inter_800ExtraBold"],
      },
      borderRadius: {
        card: "16px",
        modal: "20px",
        pill: "999px",
      },
      spacing: {
        4.5: "18px",
      },
    },
  },
  plugins: [],
};
