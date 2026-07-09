import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/tiktok_download/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssMinify: 'esbuild',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
