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
      name: 'BitshimEngine',
      fileName: 'bitshim-engine',
      formats: ['es'],
    },
  },

  plugins: [
    // dts({ entryRoot: 'src', rollupTypes: true, tsconfigPath: 'tsconfig.json' }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'lcov'], // 👈 this line enables the HTML output
      exclude: ['dist', '**/*[cC]onfig.ts', '**/index.ts'],
    },
  },
});
