const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');//
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ...
    'node_modules/flowbite-react/lib/esm/**/*.js',
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite/**/*.{js,jsx,ts,tsx}",
    './*/**/*.{js,ts,jsx,tsx,html,css}',
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html*}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        'champane': ['Champane & Limousines', 'sans-serif'],
        'champaneBold': ['Champane & Limousines Bold', 'sans-serif'],
        'futura': ['Futura', 'sans-serif'],
        'futuraBold': ['Futura Bold', 'sans-serif'],
        'typegraphic': ['Typegraphica', 'sans-serif'],
        'jostRegular': ['Jost Regular', 'sans-serif'],
        'jostBold': ['Jost Bold', 'sans-serif'],
        'jostItalic': ['Jost Italic', 'sans-serif'],
     },
      height: {
        '300': '300px',
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      colors: {
        'custom-fondo': '#ffffff',
        'custom-dark': '#333333',
        'custom-dark-hover': '#212121',
        'custom-hover': '#4aa3df',
        'custom-hover-invert': '#95e9fb',
        'custom-marca-boton': '#6e6c35',
        'custom-marca-boton-variante': '#44482c',
        'custom-marca-boton-variante2': '#849b50',
        'custom-marca-boton-alterno':'#b1c181',
        'custom-marca-boton-alterno2':'#e8d79a',
      },

      blur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(110, 108, 53, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(110, 108, 53, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }
    },
  },
  plugins: [
    // ...
    require('flowbite/plugin'),
    require('tailwindcss-animated'),
    require('tailwindcss-ripple')(),
  ],
};
