/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './admin/*.html',
    './js/**/*.js',
  ],
  safelist: [
    // Classes construites dynamiquement dans auth-ui.js
    'text-sp-600', 'text-gray-500',
    'from-sp-500', 'to-sp-600',
    'shadow-sp-500/30',
  ],
  theme: {
    extend: {
      colors: {
        'sp': {
          50:  '#FEF4F2',
          100: '#FCDBD5',
          200: '#F8B4A8',
          300: '#F0806D',
          400: '#E3543D',
          500: '#C4311B',
          600: '#A42618',
          700: '#7F1D12',
          800: '#57130C',
          900: '#360C07',
        },
        'or': {
          50:  '#FDF9EF',
          100: '#FDF3DC',
          200: '#F9E0A0',
          300: '#F2C860',
          400: '#E5A930',
          500: '#C4892A',
          600: '#A36E20',
          700: '#7D5118',
          800: '#5A3A12',
          900: '#3B260C',
        },
        'ivoire': '#F8F5EF',
        'encre':  '#18130F',
      },
      fontFamily: {
        'display':   ['Playfair Display', 'serif'],
        'body':      ['Inter', 'sans-serif'],
        'handwrite': ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
}
