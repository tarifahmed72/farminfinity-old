import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Ensure URL is HTTPS
var normalizeUrl = function (url) {
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
                rewrite: function (path) { return path.replace(/^\/api/, '/api'); },
                configure: function (proxy) {
                    proxy.on('proxyReq', function (proxyReq) {
                        proxyReq.setHeader('Origin', 'https://farmin.vercel.app');
                        proxyReq.setHeader('Referer', 'https://farmin.vercel.app/');
                    });
                }
            }
        }
    },
    preview: {
        port: 3000,
        host: true,
        strictPort: true,
    }
});
