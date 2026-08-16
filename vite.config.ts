import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import manifest from './manifest.ts';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    target: 'chrome120',
    cssTarget: 'chrome120',
    sourcemap: false,
    rolldownOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
