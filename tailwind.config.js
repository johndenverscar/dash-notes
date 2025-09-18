/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'bg-primary-light': '#fafafa',
        'bg-secondary-light': '#ffffff',
        'text-primary-light': '#1a1a1a',
        'text-secondary-light': '#6b7280',
        'text-tertiary-light': '#9ca3af',
        'border-primary-light': '#e5e7eb',
        'border-secondary-light': '#d1d5db',
        'accent-primary': '#61afef',
        'accent-secondary': '#528bff',

        // Dark mode colors (One Dark Pro)
        'bg-primary-dark': '#282c34',
        'bg-secondary-dark': '#21252b',
        'text-primary-dark': '#abb2bf',
        'text-secondary-dark': '#5c6370',
        'text-tertiary-dark': '#4b5263',
        'border-primary-dark': '#3e4451',
        'border-secondary-dark': '#4b5263',
      },
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', "'SF Pro Display'", "'SF Pro Text'", 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: ['selector', '[data-theme="dark"]'],
}