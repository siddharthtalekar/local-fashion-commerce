/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#fff0f3',
          100: '#ffe3e8',
          200: '#ffcbd5',
          300: '#ffa1b5',
          400: '#ff6c8b',
          500: '#ff3e6c',
          600: '#ed1c4d',
          700: '#c80f3b',
          800: '#a71136',
          900: '#8f1333',
        },
        myntra: {
          pink: '#ff3e6c',
          dark: '#282c3f',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease both',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'spin': 'spin 1s linear infinite',
      },
      backgroundImage: {
        'grid-admin': 'radial-gradient(rgba(255,62,108,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
