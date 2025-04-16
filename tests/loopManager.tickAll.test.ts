import { createLoopManager } from '@/core';
import { describe, it, expect, vi } from 'vitest';

describe('Loop Manager - tickAll', () => {
  it('should start all stopped loops when tickAll is called', () => {
    const manager = createLoopManager();
    const callback = vi.fn();

    manager.registerLoop({
      name: 'loopA',
      interval: 100,
      callback,
    });

    manager.registerLoop({
      name: 'loopB',
      interval: 100,
      callback,
    });

    // Ensure both loops are initially stopped
    expect(manager.isRunning({ name: 'loopA' })).toBe(false);
    expect(manager.isRunning({ name: 'loopB' })).toBe(false);

    manager.tickAll();

    // After tickAll, both loops should be running
    expect(manager.isRunning({ name: 'loopA' })).toBe(true);
    expect(manager.isRunning({ name: 'loopB' })).toBe(true);
  });

  it('should keep already running loops running when tickAll is called', () => {
    const manager = createLoopManager();
    const callback = vi.fn();

    manager.registerLoop({
      name: 'loopC',
      interval: 100,
      callback,
    });

    // Start loopC
    manager.startLoop({ name: 'loopC' });

    // Ensure loopC is running
    expect(manager.isRunning({ name: 'loopC' })).toBe(true);

    manager.tickAll();

    // After tickAll, loopC should still be running
    expect(manager.isRunning({ name: 'loopC' })).toBe(true);
  });
});
