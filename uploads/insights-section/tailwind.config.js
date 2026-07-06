import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Vite runs from the repo root (parent dir), so Tailwind resolves relative content
// globs against the wrong CWD. Anchor them to this config's own directory instead
// (forward slashes so fast-glob matches correctly on Windows).
const root = dirname(fileURLToPath(import.meta.url)).replace(/\\/g, '/');

/** @type {import('tailwindcss').Config} */
export default {
  content: [`${root}/index.html`, `${root}/src/**/*.{ts,tsx}`],
  theme: {
    extend: {
      fontFamily: {
        'helvetica-neue': ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
