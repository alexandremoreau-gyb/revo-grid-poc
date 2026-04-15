/**
 * vitest.config.ts
 * ----------------
 * Configuration Vitest pour un projet Nuxt.
 * Utilise l'environnement Nuxt pour que les auto-imports
 * (useI18n, ref, computed…) fonctionnent dans les tests.
 */
import path from 'path'

import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  resolve: {
    alias: {
      '~/assets/css/main.css': path.resolve(__dirname, 'tests/stubs/empty.css'),
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'nuxt',
    globals: true,
    environmentOptions: {
      nuxt: {
        rootDir: '.',
      },
    },
    // Coverage scope is intentionally limited to Revo Grid components so the rest of the project doesn't affect stats.
    coverage: {
      provider: 'v8',
      all: true,
      clean: true,
      include: ['components/grid/**/*.{js,jsx,ts,tsx,vue}'],
      exclude: [
        '**/*.d.ts',
        '**/*.spec.*',
        '**/*.test.*',
        '**/__tests__/**',
        '**/tests/**',
        '**/*.stories.*',
      ],
      reporter: ['text', 'html'],
    },
  },
})
