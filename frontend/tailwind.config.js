/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'theme-bg': 'var(--bg-main)',
        'theme-card': 'var(--bg-card)',
        'theme-card-hover': 'var(--bg-card-hover)',
        'theme-border': 'var(--border-card)',
        'theme-border-hover': 'var(--border-card-hover)',
        'theme-text': 'var(--text-main)',
        'theme-text-muted': 'var(--text-muted)',
        'theme-accent': 'var(--accent-purple)',
      }
    },
  },
  plugins: [],
}
