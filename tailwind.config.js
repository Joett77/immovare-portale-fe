/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    colors: {
      primary: '#67D2DF',
      'primary-light': '#ADF2F7',
      'primary-dark': '#2E5D63',
      secondary: '#ECE81A',
      'secondary-light': '#FCFBD9',
      'secondary-dark': '#A9A417',
      'secondary-grey': '#F6F6F6',
      white: '#FFFFFF',
      black: '#3C3D3E',
      'trustpilot-green': '#00b67a',
      transparent: 'transparent',
      'gray-300': '#CBCCCD',
      'blue-600': '#1E88E5',
      'red-600': '#dc2626',
      'red-100': '#de8ea1',
      'red-500': '#dc2626',
      'gray-100': '#F6F6F6',
      'green-100': '#CCFCD4',
      'green-500': '#10B981',
      'green-50': '#10B981',
    },
    fontFamily: {
      sans: ['Open Sans', 'sans-serif'],
      montserrat: ['Montserrat', 'sans-serif'],
    },
    zIndex: {
      100: '9999',
    },
    extend: {
      inset: {
        '3px': '3px',
      },
    },
  },
  plugins: [],
};
