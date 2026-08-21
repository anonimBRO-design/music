/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0c0c14',
        surface: '#141422',
        surfaceLight: '#1d1d32',
        spotifyGreen: '#1db954',
        neonGreen: '#00ff87',
        accentPink: '#ff2d78',
        accentPurple: '#7928ca',
        textPrimary: '#ffffff',
        textSecondary: '#a0a0b8',
        textMuted: '#686882',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'equalizer-1': 'eq1 1s ease-in-out infinite alternate',
        'equalizer-2': 'eq2 1.2s ease-in-out infinite alternate',
        'equalizer-3': 'eq3 0.8s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        eq1: { '0%': { height: '3px' }, '100%': { height: '14px' } },
        eq2: { '0%': { height: '12px' }, '100%': { height: '4px' } },
        eq3: { '0%': { height: '4px' }, '100%': { height: '15px' } },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
