import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local dev we proxy /api to the backend so the frontend can use
// relative URLs (no CORS, no hardcoded host). In production the API base
// is supplied via VITE_API_BASE_URL instead.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
