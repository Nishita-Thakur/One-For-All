import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Allows this temporary Vite site to be reached through an ngrok tunnel.
    allowedHosts: ['backstage-aspire-unfilled.ngrok-free.dev'],
  },
});