import { createLoopManager } from '@/engine';
import { describe, expect, it } from 'vitest';

describe('Loop Manager', () => {
  it('should register and manage loops correctly', () => {
    const manager = createLoopManager();
    const loopConfig = {
      name: 'testLoop',
      interval: 100,
      callback: jest.fn(),
    };

    manager.registerLoop(loopConfig);
    expect(manager.isRunning({ name: 'testLoop' })).toBe(false);

    manager.startLoop({ name: 'testLoop' });
    expect(manager.isRunning({ name: 'testLoop' })).toBe(true);

    manager.stopLoop({ name: 'testLoop' });
    expect(manager.isRunning({ name: 'testLoop' })).toBe(false);
  });
});
