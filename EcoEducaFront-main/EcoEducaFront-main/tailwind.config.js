/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta corporativa sobria (reemplaza el esquema verde/eco anterior)
        eco: {
          green: "#1E3A5F", // Azul marino institucional (color primario)
          lightgreen: "#3D6FA8", // Azul medio (hover / acentos)
          dark: "#0B1522", // Casi negro azulado (fondos oscuros)
          accent: "#B8923F", // Dorado apagado (detalles/acento puntual)
        },
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(11, 21, 34, 0.18)",
      },
    },
  },
  plugins: [],
};
