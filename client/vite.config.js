import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  const proxyTarget =
    (env.VITE_API_URL && env.VITE_API_URL.replace(/\/+$/, '')) ||
    'https://chat-without-internet.onrender.com';

  return {
    plugins: [react()],
    define: {
      'process.env': env, // make env vars available
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
