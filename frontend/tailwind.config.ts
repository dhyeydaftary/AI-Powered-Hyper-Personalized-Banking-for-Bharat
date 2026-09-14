import type { Config } from 'tailwindcss';

// Design tokens derived from DESIGN.md (Coinbase design analysis), taken for
// their institutional, trust-focused, restrained qualities per Section 7 of
// the frontend spec — not for anything crypto-specific, which is discarded.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        'surface-soft': '#f7f7f7',
        'surface-card': '#ffffff',
        'surface-strong': '#eef0f3',
        'surface-dark': '#0a0b0d',
        'surface-dark-elevated': '#16181c',
        ink: '#0a0b0d',
        body: '#5b616e',
        'body-strong': '#0a0b0d',
        muted: '#7c828a',
        'muted-soft': '#a8acb3',
        hairline: '#dee1e6',
        'hairline-soft': '#eef0f3',
        primary: {
          DEFAULT: '#0052ff',
          active: '#003ecc',
          disabled: '#a8b8cc',
          soft: '#eaf0ff',
        },
        'on-primary': '#ffffff',
        up: '#05b169',
        down: '#cf202f',
        warn: '#a4650a',
        'warn-soft': '#fdf3e2',
        'up-soft': '#e6f7ef',
        'down-soft': '#fbe9ea',
        info: '#0052ff',
        'info-soft': '#eaf0ff',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '100px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        base: '16px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        section: '96px',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(10, 11, 13, 0.06)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        'slide-in-right': 'slide-in-right 220ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
