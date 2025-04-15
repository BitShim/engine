import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BitshimEngine',
      fileName: 'bitshim-engine',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
    },
  },
  plugins: [dts(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
