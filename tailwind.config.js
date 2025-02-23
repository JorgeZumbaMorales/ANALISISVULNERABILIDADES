/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A2342", // Azul oscuro
        secondary: "#3E92CC", // Azul claro
        accent: "#ff3f00", // Naranja
        background: "#F4F4F9", // Blanco suave
        textPrimary: "#4A4A4A", // Gris oscuro
        textSecondary: "#FFFFFF", // Blanco
      },
    },
  },
  plugins: [
    require('tailwindcss-primeui')
  ],
}

