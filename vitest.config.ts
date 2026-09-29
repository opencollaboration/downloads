import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const SERVER_ONLY = 'server-only';
const SERVER_ONLY_RESOLVED = '\0server-only';

function stubServerOnly(): Plugin {
  return {
    name: 'stub-server-only',
    resolveId: (id) => (id === SERVER_ONLY ? SERVER_ONLY_RESOLVED : null),
    load: (id) => (id === SERVER_ONLY_RESOLVED ? 'export {};' : null),
  };
}

export default defineConfig({
  plugins: [stubServerOnly(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
