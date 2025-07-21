import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/BillSplit.github.io/',
  plugins: [react()],
})
