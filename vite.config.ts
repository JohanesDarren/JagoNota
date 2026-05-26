import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3005,
        host: '0.0.0.0',
        proxy: {
          // Proxy all /api/* requests to the Flask backend.
          // This eliminates CORS entirely in development — the browser only
          // ever talks to localhost:3000, Vite forwards it to Flask server-side.
          '/api': {
            target: 'http://127.0.0.1:5000',
            changeOrigin: true,
            secure: false,
            // Rewrite is NOT needed here since Flask also expects /api/* paths.
            // rewrite: (path) => path.replace(/^\/api/, ''),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

