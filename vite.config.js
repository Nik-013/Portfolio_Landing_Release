import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',  // Точка означает, что корневая папка проекта — это текущая папка
  
  publicDir: 'public', // Указываем Vite, что папка со статикой (img) называется "public" (как у тебя на скрине)
  
  base: '/', // Указываем базовый путь для всех ресурсов (можно оставить пустым, если сайт будет на корне домена)

  build: {
    outDir: 'dist', // Куда соберется готовый проект
    rollupOptions: {
      input: {
        // Перечисляем все HTML файлы, чтобы Vite их увидел
        main: 'index.html',
        ru: 'ru.html',
        notfound: '404.html',
      },
    },
  },
    server: {
    open: true
  },
  css: { 
    devSourcemap: false 
  }
});