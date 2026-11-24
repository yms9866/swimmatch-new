import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The SwimMatch API (https://swimmatch.onrender.com) only accepts browser requests
// from http://localhost:5173 and https://swimmatch.vercel.app (CORS). Local dev and
// preview therefore default to port 5173, and strictPort makes Vite stop with a clear
// error if that port is taken instead of silently moving to a port the API rejects.
// Override with PORT=xxxx only if the API has been configured to allow that origin.
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  plugins: [react()],
  server: { port, strictPort: true },
  preview: { port, strictPort: true },
});
