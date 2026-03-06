import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        travel: resolve(__dirname, 'travel.html'), //Сторінка про подорожі
        shop: resolve(__dirname, 'shop.html'), //Сторінка про магазин
        about: resolve(__dirname, 'about.html'), //Сторінка про мене
        music: resolve(__dirname, 'music.html'), //Сторінка про музику
      }
    }
  }
});