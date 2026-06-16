// Tailwind CSS v4 is CSS-first: theme tokens live in src/index.css via @theme.
// This file is kept for editor tooling compatibility.
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './overlay.html', './src/**/*.{ts,tsx}'],
} satisfies Config
