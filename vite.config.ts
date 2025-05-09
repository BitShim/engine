import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'index',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },

  plugins: [
    dts({
      rollupTypes: true,
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts', '@vitest/web-worker'],
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: [
      'dist',
      'src/workers/**',
      'src/loops/**',
      '**/*[cC]onfig.ts',
      '**/*types.ts',
      '**/index.ts',
      'scripts',
    ],
    coverage: {
      // provider: 'istanbul',
      reporter: ['text', 'lcov'],
      exclude: [
        'dist/**',
        'src/workers/**',
        'src/loops/**',
        '**/*[cC]onfig.ts',
        '**/*types.ts',
        '**/index.ts',
        'scripts',
      ],
    },
  },
});
