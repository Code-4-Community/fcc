import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/frontend-embed',

  plugins: [react(), nxViteTsPaths()],
  publicDir: false,

  define: {
    // Allow WordPress pages to set window.__FCC_DONATION_API_URL__ before loading
    // the script to point at the backend (e.g. 'https://api.example.com').
    // Falls back to same-origin via the ?? '' in apiClient.ts if not set.
    'import.meta.env.VITE_API_BASE_URL': 'window.__FCC_DONATION_API_URL__',
    // Required in IIFE lib mode — React and other deps reference this Node global.
    'process.env.NODE_ENV': JSON.stringify('production'),
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/embed.tsx'),
      name: 'FCCDonation',
      fileName: 'fcc-donation',
      formats: ['iife'],
    },
    outDir: '../../apps/wordpress-plugin/fcc-donation/assets',
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@containers': path.resolve(__dirname, './src/containers'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@public': path.resolve(__dirname, './public'),
      '@shared': path.resolve(__dirname, '../../shared'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
