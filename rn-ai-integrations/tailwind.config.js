/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        body: {
          DEFAULT: 'var(--color-body-default)',
          second: 'var(--color-body-second)',
        },
        background: {
          DEFAULT: 'var(--color-background-default)',
          second: 'var(--color-background-second)',
        },
        container: {
          DEFAULT: 'var(--color-container-default)',
          second: 'var(--color-container-second)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-default)',
          second: 'var(--color-accent-second)',
        },
        overlay: 'var(--color-overlay)',
      },
    },
  },
  plugins: [],
}
