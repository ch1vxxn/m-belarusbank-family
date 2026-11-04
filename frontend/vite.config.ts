import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // GitHub Pages хостит проект по адресу /m-belarusbank-family/
  // (имя репозитория). Не меняем вручную пути в index.html —
  // base решает это на этапе сборки.
  base: '/m-belarusbank-family/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2018',
  },
})