import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/chat": "http://localhost:8000",
      "/tasks": "http://localhost:8000",
      "/ingest": "http://localhost:8000",
    },
  },
});