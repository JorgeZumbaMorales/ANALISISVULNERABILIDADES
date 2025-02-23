/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",

  ],
  theme: {
    extend: {
      colors: {
        baseAzulOscuro: "#0A2342", // Azul oscuro
        baseAzulClaro: "#3E92CC", // Azul claro
        baseNaranja: "#ff3f00", // Naranja
        fondoClaro: "#F4F4F9", // Blanco suave
        textoPrincipal: "#4A4A4A", // Gris oscuro
        textoSecundario: "#FFFFFF", // Blanco
      },
    },
  },
  plugins: [
    require('tailwindcss-primeui')
  ],
}

