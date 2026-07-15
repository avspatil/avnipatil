import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/resume": "http://localhost:3001",
      "/projects": "http://localhost:3001",
      "/news": "http://localhost:3001",
      "/config": "http://localhost:3001",
      "/auth": "http://localhost:3001",
      "/table": "http://localhost:3001",
    },
  },
})
