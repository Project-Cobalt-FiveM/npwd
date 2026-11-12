/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', '../../packages/ui/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Onest Variable"', 'sans-serif'],
      },
      colors: {
        'cb-background': '#0A0A0A',
        'cb-card': '#141414',
        'cb-popover': '#171717',
        'cb-muted': '#1C1C1C',
        'cb-secondary': '#262626',
        'cb-border': '#262626',
        'cb-input': '#2E2E2E',
        'cb-foreground': '#FAFAFA',
        'cb-muted-foreground': '#A3A3A3',
        'cb-primary': '#5078D7',
        'cb-primary-hover': '#4569C9',
        'cb-cobalt-foreground': '#7C9BE4',
        'cb-success': '#16A34A',
        'cb-destructive': '#DC2626',
      },
      transitionTimingFunction: {
        cb: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        'cb-pop': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'cb-pop': 'cb-pop 250ms cubic-bezier(0.2, 0, 0, 1) both',
      },
    },
  },
};
