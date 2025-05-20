import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://dev-api.farmeasytechnologies.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err) => {
            // tslint:disable-next-line:no-console
            console.error('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            // tslint:disable-next-line:no-console
            console.info('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            // tslint:disable-next-line:no-console
            console.info('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
