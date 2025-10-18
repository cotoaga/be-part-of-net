/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // COTOAGA.AI Design System
        'klein-bottle-green': 'var(--color-klein-bottle-green)',
        'deep-space-blue': 'var(--color-deep-space-blue)',
        'warm-canvas': 'var(--color-warm-canvas)',
        'soft-gray': 'var(--color-soft-gray)',
        'midnight-void': 'var(--color-midnight-void)',

        // Terminal colors (preserved for /root and /node-zero)
        'terminal-green': 'var(--color-terminal-green)',
        'terminal-green-dim': 'var(--color-terminal-green-dim)',
        'terminal-bg': 'var(--color-terminal-bg)',
      },
      fontFamily: {
        // COTOAGA.AI Typography
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas'],

        // Terminal mono (preserved for /root and /node-zero)
        'terminal-mono': ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}