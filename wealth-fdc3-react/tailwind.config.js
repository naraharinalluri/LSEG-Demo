/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
      colors: {
        halo: {
          bg: '#0b0e13',
          panel: '#141821',
          elevated: '#1c212c',
          border: '#ffffff12',
          borderStrong: '#ffffff24',
          text: '#e6edf3',
          muted: '#8b95a7',
          dim: '#5c6473',
          accent: '#fa6400',
          up: '#26d97f',
          upBg: '#26d97f24',
          down: '#ff4757',
          downBg: '#ff475724',
        },
        ch: { blue: '#4a90d9' },
      },
    },
  },
  plugins: [],
};
