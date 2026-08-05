/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
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
          orange: '#ff905a',
          dark: '#1a1a2e',
          gray: '#faf9f7',
          lightGray: '#ebebf0',
          text: '#535766',
          lightText: '#9098a9',
          green: '#03a685',
          card: '#ffffff',
        },
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-in': 'fadeIn 0.3s ease both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'ken-burns': 'kenBurns 8s ease-in-out infinite alternate',
        'toast': 'toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'bottom-sheet-in': 'bottomSheetIn 0.35s cubic-bezier(0.34, 1.1, 0.64, 1) both',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          'from': { transform: 'translateY(24px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.92)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-1%, -1%)' },
        },
        toastSlideIn: {
          'from': { transform: 'translateX(-50%) translateY(-100px)', opacity: '0' },
          'to': { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
        },
        bottomSheetIn: {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'brand': '0 8px 24px rgba(255,62,108,0.25)',
        'brand-lg': '0 16px 48px rgba(255,62,108,0.35)',
        'card': '0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
        'nav': '0 -4px 24px rgba(0,0,0,0.08)',
        'modal': '0 32px 80px rgba(0,0,0,0.20)',
      },
      backdropBlur: {
        'xs': '4px',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};
