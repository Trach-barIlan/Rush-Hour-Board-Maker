import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative base so the built site works when served from GitHub Pages subpath
  plugins: [react()],
})
