import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  // Dev only: the API's CORS allows just the production origin, so local
  // requests to /api are forwarded server-side. Production builds are unaffected.
  server: {
    proxy: {
      "/api": { target: "https://swimmatch.onrender.com", changeOrigin: true },
    },
  },
});
