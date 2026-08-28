import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Keep GitHub activity same-origin during regular Vite development.
      "/api/github-public": {
        target: "https://github-contributions-api.jogruber.de",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/github-public/, "/v4"),
      },
      // Other API routes can still be served by `vercel dev` when needed.
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
