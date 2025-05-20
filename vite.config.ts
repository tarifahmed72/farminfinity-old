import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ensure URL is HTTPS
const normalizeUrl = (url: string) => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

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
          proxy.on('proxyReq', (proxyReq, req) => {
            // tslint:disable-next-line:no-console
            console.info('Sending Request:', req.method, req.url);
            // Ensure request uses HTTPS
            if (proxyReq.protocol === 'http:') {
              proxyReq.protocol = 'https:';
            }
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
