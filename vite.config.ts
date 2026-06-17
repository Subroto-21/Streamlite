import { defineConfig } from 'vite'
import { resolve } from 'path'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        builder: resolve(__dirname, 'index.html'),
        overlay: resolve(__dirname, 'overlay.html'),
        landing: resolve(__dirname, 'landing.html'),
      },
    },
  },
})
