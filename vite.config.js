import { defineConfig } from 'vite';

export default defineConfig({
  // Базовый путь. Точка в начале (./) помогает, если сайт лежит не в корне домена,
  // но для Netlify лучше оставить '/' или auto.
  base: '/', 

  // Vite сам знает, где root и public, если ты не переименовывал папки.
  // Лишние указания лучше убрать, чтобы не путать сборщик.
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets', // Складывать JS/CSS в assets
    sourcemap: true,     // Полезно, чтобы видеть ошибки в коде на проде
    emptyOutDir: true,   // Чистим папку dist перед сборкой
    
    rollupOptions: {
      // Явно указываем все HTML файлы, чтобы Vite их нашел
      input: {
        main: './index.html',
        ru: './ru.html',
        notfound: './404.html',
      },
    },
  },
  
  // Исправление для CSS
  css: {
    devSourcemap: true,
  },
  
  server: {
    open: true
  }
});