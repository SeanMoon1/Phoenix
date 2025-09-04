import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
    // 빌드 최적화 설정
    minify: "esbuild",
    sourcemap: true,
  },
  server: {
    port: 5173, // Vite 기본 포트 사용
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
    include: ["react", "react-dom", "zustand", "styled-components"],
  },
});
