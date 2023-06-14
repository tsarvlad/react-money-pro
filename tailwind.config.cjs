/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    colors: {
      'white': '#fff',
      'purple': '#7e5bef',
      'pink': '#ff49db',
      'orange': '#ff7849',
      'yellow': '#ffc82c',
      'gray-dark': '#273444',
      'gray': '#8492a6',
      'gray-light': '#d3dce6',
      'sky': '#547fa9',
      'secondarysky': '#95d8ef',
      //Dark theme colors
      'lightblue': '#aab3c8',
      'blue': '#889fc2',
      'mediumblue': '#42587a',
      'strongblue': '#31436e',
      'darkblue': '#011a3f',
      'green': '#55982e',
      'darkgreen': '#448125',
      'red': '#a7251d',
      'darkred': '#8b1a15'
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  },
  plugins: [],
}