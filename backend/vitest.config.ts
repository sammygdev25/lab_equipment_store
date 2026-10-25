import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/env.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
