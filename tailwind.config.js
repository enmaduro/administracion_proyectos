// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981', // Verde Esmeralda (Dinero/Éxito)
          600: '#059669',
          700: '#047857',
        },
        secondary: {
          50: '#eff6ff',
          500: '#3b82f6', // Azul (Acciones Secundarias)
          600: '#2563eb',
        },
        background: '#f8fafc', // Fondo general (Slate muy suave)
        surface: '#ffffff',    // Fondo de tarjetas
      }
    },
  },
  plugins: [],
}