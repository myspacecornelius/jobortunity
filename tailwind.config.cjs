const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"InterVariable"', ...defaultTheme.fontFamily.sans],
        display: ['"DM Serif Display"', ...defaultTheme.fontFamily.serif],
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
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft-lg': '0 24px 48px rgba(38, 61, 56, 0.12)',
        'inner-card': 'inset 0 1px 0 rgba(255, 255, 255, 0.35)',
      },
      backgroundImage: {
        'geodesic-grid':
          'radial-gradient(circle at 12% 20%, rgba(53, 127, 114, 0.22) 0, rgba(53, 127, 114, 0) 55%), radial-gradient(circle at 82% 8%, rgba(198, 122, 90, 0.18) 0, rgba(198, 122, 90, 0) 50%), linear-gradient(125deg, rgba(242, 233, 217, 0.92), rgba(218, 230, 226, 0.96))',
      },
    },
  },
  plugins: [],
};
