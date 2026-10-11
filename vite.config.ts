import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Works both at the repository root and at /<repo>/ on GitHub Pages.
  base: './',
  build: { target: 'es2022', sourcemap: true },
});
