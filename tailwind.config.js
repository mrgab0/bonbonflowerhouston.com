/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2a0002',
          burgundy: '#8B0024',
          modern: '#D81B60',
          dark: '#1a0001',
          light: '#fff0ef',
        },
        secondary: {
          DEFAULT: '#745b0f',
          gold: '#D4AF37',
          light: '#ffdf92',
        },
        surface: {
          DEFAULT: '#fff8f7',
          container: '#faeae9',
          high: '#f5e5e3',
        },
        carbon: '#221a19',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'var(--font-plus-jakarta)', 'Montserrat', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['var(--font-playfair)', 'var(--font-manrope)', 'Playfair Display', 'Manrope', 'serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        body: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0px 4px 20px rgba(42,0,2,0.06)',
        'premium-hover': '0px 12px 30px rgba(42,0,2,0.12)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
