/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070306',
          900: '#0b0608',
          800: '#140a0c',
          700: '#1a0d10',
        },
        crimson: {
          50:  '#fff1f2',
          100: '#ffe0e3',
          200: '#ffc2c9',
          300: '#ff94a0',
          400: '#ff5b6c',
          500: '#ff2b44',
          600: '#e50d2a',
          700: '#b90522',
          800: '#8a0520',
          900: '#4c0210',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        glow: '0 0 0 1px rgba(255, 43, 68, 0.35), 0 10px 40px -10px rgba(255, 43, 68, 0.55)',
        'glow-sm': '0 0 0 1px rgba(255, 43, 68, 0.3), 0 6px 20px -6px rgba(255, 43, 68, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
