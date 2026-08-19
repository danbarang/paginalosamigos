import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/paginalosamigos/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        especialidades: resolve(__dirname, 'especialidades.html'),
        programas: resolve(__dirname, 'programas.html'),
        reservas: resolve(__dirname, 'reservas.html'),
        sello: resolve(__dirname, 'sello.html'),
        terapias: resolve(__dirname, 'terapias.html')
      }
    }
  }
});
