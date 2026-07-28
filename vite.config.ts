import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from "@tailwindcss/vite";
import compression from 'vite-plugin-compression';

const cspPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https://galerie.auszweiwirdeins.de https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://accounts.google.com https://sveltia-cms-auth.sven-oliverpaetzel.workers.dev",
  "font-src 'self' https://fonts.bunny.net",
  "form-action 'self'",
  "frame-src https://kommrum-895d1.firebaseapp.com",
  "img-src 'self' https://images.unsplash.com https://placeholdit.com https://galerie.auszweiwirdeins.de https://*.tile.openstreetmap.org data:",
  "manifest-src 'self'",
  "script-src 'self' https://apis.google.com 'unsafe-eval'",
  "style-src 'self' https://fonts.bunny.net 'unsafe-inline'",
  "worker-src 'self' blob:",
].join('; ')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    compression(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    {
      name: 'csp',
      apply: 'build',
      transformIndexHtml(html: string) {
        return html.replace(
          '</head>',
          `  <meta http-equiv="Content-Security-Policy" content="${cspPolicy}">\n</head>`,
        )
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://galerie.auszweiwirdeins.de',
        changeOrigin: true,
      },
    },
  },
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('vue') || id.includes('vue-router')) return 'vendor-vue';
            return 'vendor';
          }
        }
      }
    }
  },
  base: '/',
  assetsInclude: ['**/*.heic', '**/*.HEIC'],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
