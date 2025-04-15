import { createEngine } from '@/index';
import { describe, it } from 'vitest';

describe('Engine Worker', () => {
  it('should start and stop the worker correctly', () => {
    const engine = createEngine();

    engine.start();
    // Add assertions to verify tick messages are received

    engine.stop();
    // Add assertions to ensure no further messages are received
  });
});
