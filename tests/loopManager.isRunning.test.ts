import { createLoopManager } from '@/core';
import { describe, it, expect, vi } from 'vitest';

describe('Loop Manager - isRunning', () => {
  it('should return true for a running loop', () => {
    const manager = createLoopManager();
    const loopConfig = {
      name: 'runningLoop',
      interval: 100,
      callback: vi.fn(),
    };

    manager.registerLoop(loopConfig);
    manager.startLoop({ name: 'runningLoop' });

    expect(manager.isRunning({ name: 'runningLoop' })).toBe(true);
  });

  it('should return false for a stopped loop', () => {
    const manager = createLoopManager();
    const loopConfig = {
      name: 'stoppedLoop',
      interval: 100,
      callback: vi.fn(),
    };

    manager.registerLoop(loopConfig);
    // Not starting the loop

    expect(manager.isRunning({ name: 'stoppedLoop' })).toBe(false);
  });

  it('should return false for a non-existent loop', () => {
    const manager = createLoopManager();

    expect(manager.isRunning({ name: 'nonExistentLoop' })).toBe(false);
  });
});
