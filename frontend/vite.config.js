import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Deployment: VITE_* env vars are loaded from frontend/.env.local (dev) or Vercel dashboard (prod)
  envDir: '.',
  build: {
    // Deployment: ensure production build outputs to dist/ for Vercel
    outDir: 'dist',
  },
})
