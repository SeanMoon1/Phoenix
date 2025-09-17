import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리 분리
          'ui-vendor': ['@hookform/resolvers', 'yup', 'zustand'],
          // TanStack Query 분리
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 1000,
    // 압축 최적화 (esbuild 사용)
    minify: 'esbuild',
  },
});
