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
        ws: true, // Enable WebSocket proxying
        xfwd: true, // Add x-forward headers
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err) => {
            console.error('Proxy error:', err);
          });

          proxy.on('proxyReq', (proxyReq, req) => {
            console.info('Sending Request:', req.method, req.url);
            
            // Ensure request uses HTTPS
            if (proxyReq.protocol === 'http:') {
              proxyReq.protocol = 'https:';
            }

            // Add necessary headers
            proxyReq.setHeader('Origin', 'https://farmin.vercel.app');
            proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');

            // Handle POST/PUT requests
            if (['POST', 'PUT'].includes(req.method || '') && req.body) {
              const bodyData = JSON.stringify(req.body);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });

          proxy.on('proxyRes', (proxyRes, req) => {
            console.info('Received Response:', {
              statusCode: proxyRes.statusCode,
              url: req.url,
              headers: proxyRes.headers
            });
          });
        }
      }
    }
  }
})
