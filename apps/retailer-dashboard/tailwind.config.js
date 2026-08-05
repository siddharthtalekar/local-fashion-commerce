/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff0f3',
          100: '#ffe3e8',
          200: '#ffcbd5',
          300: '#ffa1b5',
          400: '#ff6c8b',
          500: '#FF3E6C',
          600: '#ed1c4d',
          700: '#c80f3b',
          800: '#a71136',
          900: '#8f1333',
        },
        myntra: {
          pink:      '#FF3E6C',
          orange:    '#FF905A',
          dark:      '#282C3F',
          gray:      '#F5F5F6',
          lightGray: '#EAEAEC',
          text:      '#535766',
          lightText: '#7E818C',
          green:     '#03A685',
        },
        sidebar: {
          bg:     '#1A1D2E',
          border: 'rgba(255,255,255,0.06)',
        },
      },
      animation: {
        'slide-up':    'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-down':  'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'fade-in':     'fadeIn 0.3s ease both',
        'scale-in':    'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'toast-in':    'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'count-up':    'countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        shimmer:       'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
