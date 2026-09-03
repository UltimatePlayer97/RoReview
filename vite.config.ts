import { defineConfig } from 'vite';

export default defineConfig({
  // Replace import.meta with an empty object so Vite's preload helper doesn't rely on import.meta in IIFE builds.
  // This mirrors Vite's recommendation for non-ESM output formats.
  define: {
    'import.meta': '{}'
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: 'src/main.ts',

      output: {
        entryFileNames: 'content.js',
        format: 'iife',
      },
    },
  },
});
