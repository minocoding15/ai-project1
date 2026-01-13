import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      host: '10.0.1.80'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
})
