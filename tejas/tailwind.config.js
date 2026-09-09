/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          light: '#1e5e3a',
          DEFAULT: '#0d3a1f',
          dark: '#06200f',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        electric: {
          light: '#39ff14',
          DEFAULT: '#00ff88',
          dark: '#00cc6a',
        },
        navy: {
          light: '#1e293b',
          DEFAULT: '#0f172a',
          dark: '#020617',
        },
        charcoal: {
          light: '#1f2937',
          DEFAULT: '#111827',
          dark: '#030712',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 255, 136, 0.05), 0 4px 12px 0 rgba(0, 0, 0, 0.3)',
        'glass-glow': '0 8px 32px 0 rgba(0, 255, 136, 0.15), 0 0 20px 0 rgba(0, 255, 136, 0.1)',
        'neon': '0 0 10px rgba(0, 255, 136, 0.3), 0 0 20px rgba(0, 255, 136, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'flow-x': 'flowX 10s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.5, filter: 'blur(8px)' },
          '50%': { transform: 'scale(1.05)', opacity: 0.8, filter: 'blur(12px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        flowX: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
