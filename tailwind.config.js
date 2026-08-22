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
        background: '#05050a',
        surface: '#0d0d18',
        surfaceLight: '#161626',
        spotifyGreen: '#1db954',
        neonGreen: '#30d158',
        accentPink: '#ff375f',
        accentPurple: '#bf5af2',
        accentBlue: '#0a84ff',
        accentCyan: '#64d2ff',
        textPrimary: '#ffffff',
        textSecondary: '#a0a0b8',
        textMuted: '#686882',
        // iOS 27 Spatial Tokens
        iosBg: '#040408',
        iosGlass: 'rgba(255, 255, 255, 0.05)',
        iosGlassHover: 'rgba(255, 255, 255, 0.09)',
        iosBorder: 'rgba(255, 255, 255, 0.12)',
        iosBorderBright: 'rgba(255, 255, 255, 0.22)',
        iosBlue: '#0A84FF',
        iosEmerald: '#30D158',
        iosPurple: '#BF5AF2',
        iosPink: '#FF375F',
        iosIndigo: '#5E5CE6',
      },
      fontFamily: {
        syne: ['Syne', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'sans-serif'],
      },
      borderRadius: {
        'ios-sm': '14px',
        'ios-md': '20px',
        'ios-lg': '26px',
        'ios-xl': '32px',
      },
      boxShadow: {
        'ios-glass': '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
        'ios-card': '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'ios-glow': '0 0 25px rgba(10, 132, 255, 0.25)',
      },
      animation: {
        'equalizer-1': 'eq1 1s ease-in-out infinite alternate',
        'equalizer-2': 'eq2 1.2s ease-in-out infinite alternate',
        'equalizer-3': 'eq3 0.8s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-ambient': 'floatAmbient 8s ease-in-out infinite alternate',
      },
      keyframes: {
        eq1: { '0%': { height: '3px' }, '100%': { height: '14px' } },
        eq2: { '0%': { height: '12px' }, '100%': { height: '4px' } },
        eq3: { '0%': { height: '4px' }, '100%': { height: '15px' } },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        floatAmbient: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(30px, -20px) scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
}
