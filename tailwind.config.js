/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0070f3", // A vibrant blue for primary actions
        accent: "#ff4081", // A bright pink for accents and highlights
        neutral: {
          100: "#f5f5f5", // Light grey for backgrounds
          700: "#333333", // Dark grey for text and elements
          800: "#222222", // Darker grey for headers and important text
        },
        success: "#4caf50", // Green for success messages
        warning: "#ffeb3b", // Yellow for warnings
        error: "#f44336", // Red for errors and important actions
      },
    },
  },
  plugins: [],
}
