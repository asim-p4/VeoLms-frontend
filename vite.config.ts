/**
 * Vite Configuration File
 * Sets up the build tool and development server.
 * Includes path aliases to allow absolute imports (e.g., '@/components/...').
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'SERVER_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
