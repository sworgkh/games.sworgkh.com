import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/shared': resolve(__dirname, 'src/shared'),
      '@/utils': resolve(__dirname, 'src/shared/utils'),
      '@/components': resolve(__dirname, 'src/shared/components')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/home/index.html'),
        'tic-tac-toe': resolve(__dirname, 'src/pages/tic-tac-toe/index.html'),
        'five-in-row': resolve(__dirname, 'src/pages/five-in-row/index.html'),
        'connect-four': resolve(__dirname, 'src/pages/connect-four/index.html'),
        'language-cards': resolve(__dirname, 'src/pages/language-cards/index.html')
      }
    }
  },
  server: {
    open: '/src/pages/home/index.html'
  }
}) 