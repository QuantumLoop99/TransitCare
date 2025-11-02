import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend-local Vite config
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    // Ensure Vite can detect an entry and pre-bundle deps without warnings
    entries: ['index.html'],
    exclude: ['lucide-react'],
  },
});
