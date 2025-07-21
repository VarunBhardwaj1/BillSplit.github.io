import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/BillSplit.github.io/', // this ensures correct paths for GitHub Pages
  plugins: [react()],
});
