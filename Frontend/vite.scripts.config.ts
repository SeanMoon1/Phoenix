import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'scripts/game-script-tool',
  build: {
    outDir: '../../dist-scripts',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'scripts/game-script-tool/index.html'),
      },
    },
    // 빌드 최적화 설정
    minify: 'esbuild',
    sourcemap: true,
  },
  server: {
    port: 5174, // scripts 도구용 포트
    open: true,
    host: true, // 네트워크 접근 허용
    // HMR 설정 개선
    hmr: {
      overlay: true, // 에러 오버레이 표시
    },
    // 개발 서버 안정성 향상
    watch: {
      usePolling: true, // Windows에서 파일 감시 개선
      interval: 1000,
    },
  },
  // 개발 환경 최적화
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'styled-components'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'scripts/game-script-tool/src'),
    },
  },
});
