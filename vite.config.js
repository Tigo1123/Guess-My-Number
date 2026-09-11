import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: [
      'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'audio/ambient-loop.wav',
      'images/**/*.webp', 'images/**/*.jpeg',
    ],
    manifest: {
      name: 'Guess My Number',
      short_name: 'Guess Number',
      description: 'A modern number guessing game with multiple game modes, player statistics, achievements, and challenges.',
      display: 'standalone',
      start_url: './',
      scope: './',
      theme_color: '#070a0f',
      background_color: '#070a0f',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
