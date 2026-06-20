import { defineConfig } from 'vite'
import { resolve } from 'path'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        builder: resolve(__dirname, 'builder.html'),
        overlay: resolve(__dirname, 'overlay.html'),
        featureRequest: resolve(__dirname, 'feature-request.html'),
      },
    },
  },
})
