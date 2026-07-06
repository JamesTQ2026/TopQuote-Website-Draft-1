import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Vite is launched from the repo root (with `insights-section` as its root arg),
// so Node's CWD is the parent dir. Tailwind resolves `tailwind.config.js`
// relative to CWD, so we point it at this directory's config explicitly.
const here = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [tailwindcss(join(here, 'tailwind.config.js')), autoprefixer()],
};
