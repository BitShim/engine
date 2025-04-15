import { afterAll, beforeAll, vi } from 'vitest';

// Stub for requestAnimationFrame and cancelAnimationFrame
beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 16),
  );
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));

  // Stub for Worker API
  vi.stubGlobal(
    'Worker',
    class {
      postMessage = vi.fn();
      terminate = vi.fn();
      onmessage: ((event: MessageEvent) => void) | null = null;
    },
  );
});

// Clean up all stubs
afterAll(() => {
  vi.unstubAllGlobals();
});
