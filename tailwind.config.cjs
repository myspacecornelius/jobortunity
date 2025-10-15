const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"InterVariable"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        pop: {
          DEFAULT: 'hsl(var(--pop) / <alpha-value>)',
          foreground: 'hsl(var(--pop-foreground) / <alpha-value>)',
        },
        positive: {
          DEFAULT: 'hsl(var(--positive) / <alpha-value>)',
          foreground: 'hsl(var(--positive-foreground) / <alpha-value>)',
        },
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.4rem',
        '3xl': '1.8rem',
      },
      boxShadow: {
        'soft-lg': '0 30px 60px rgba(20, 20, 20, 0.08)',
        'inner-card': 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      transitionTimingFunction: {
        'gentle-spring': 'cubic-bezier(0.21, 1, 0.27, 1)',
      },
    },
  },
  plugins: [],
};
