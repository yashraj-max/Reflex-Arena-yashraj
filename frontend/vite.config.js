import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite = the tool that runs the dev server and builds the site for Vercel.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
