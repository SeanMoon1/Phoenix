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
    port: 5173,
    host: 'localhost',
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
      // 4GB 메모리 활용을 위한 병렬 처리 최적화
      maxParallelFileOps: 4,
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 2000,
    // 압축 최적화 (esbuild 사용)
    minify: 'esbuild',
    // 4GB 메모리 활용을 위한 최적화 설정
    target: 'es2020',
    // 소스맵 활성화 (개발 편의성)
    sourcemap: true,
    // 빌드 성능 최적화
    reportCompressedSize: true,
    // 메모리 사용량 최적화
    assetsInlineLimit: 4096,
  },
});
