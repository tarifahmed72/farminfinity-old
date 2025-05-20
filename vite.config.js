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
                target: normalizeUrl('https://dev-api.farmeasytechnologies.com'),
                changeOrigin: true,
                secure: true,
                rewrite: function (path) { return path.replace(/^\/api/, '/api'); },
                configure: function (proxy, _options) {
                    proxy.on('error', function (err) {
                        // tslint:disable-next-line:no-console
                        console.error('proxy error', err);
                    });
                    proxy.on('proxyReq', function (_proxyReq, req) {
                        // tslint:disable-next-line:no-console
                        console.info('Sending Request:', req.method, req.url);
                        // Ensure the request is using HTTPS
                        if (req.headers.host) {
                            req.headers.host = req.headers.host.replace('http://', 'https://');
                        }
                    });
                    proxy.on('proxyRes', function (proxyRes, req) {
                        // tslint:disable-next-line:no-console
                        console.info('Received Response:', proxyRes.statusCode, req.url);
                    });
                }
            }
        }
    }
});
