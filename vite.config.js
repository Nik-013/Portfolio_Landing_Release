import { defineConfig } from 'vite';

export default defineConfig({
  // Точка означает, что корневая папка проекта — это текущая папка
  root: '.', 
  
  // Указываем Vite, что папка со статикой (img) называется "public" (как у тебя на скрине)
  publicDir: 'public', 
  
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
  }
});