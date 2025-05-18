import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore eval warnings from js-sha256
        if (warning.code === 'EVAL' && warning.id?.includes('js-sha256')) {
          return;
        }
        warn(warning);
      },
    },
  },
})
