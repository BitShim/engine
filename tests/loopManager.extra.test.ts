import { createLoopManager } from '@/core';
import { describe, it, expect, vi } from 'vitest';

describe('Loop Manager (Extended)', () => {
  it('should warn when registering a duplicate loop', () => {
    const manager = createLoopManager();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const loopConfig = {
      name: 'duplicateLoop',
      interval: 100,
      callback: vi.fn(),
    };

    manager.registerLoop(loopConfig);
    manager.registerLoop(loopConfig); // duplicate
    expect(spy).toHaveBeenCalledWith(
      'Loop with name "duplicateLoop" is already registered.',
    );

    spy.mockRestore();
  });

  it('should warn when starting or stopping an unknown loop', () => {
    const manager = createLoopManager();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    manager.startLoop({ name: 'ghostLoop' });
    expect(spy).toHaveBeenCalledWith('Loop "ghostLoop" not found.');

    manager.stopLoop({ name: 'ghostLoop' });
    expect(spy).toHaveBeenCalledWith('Loop "ghostLoop" not found.');

    spy.mockRestore();
  });

  it('should start and stop all loops correctly', () => {
    const manager = createLoopManager();
    const startSpy = vi.fn();
    const stopSpy = vi.fn();

    manager.registerLoop({
      name: 'loopOne',
      interval: 10,
      callback: () => {},
    });

    manager.registerLoop({
      name: 'loopTwo',
      interval: 10,
      callback: () => {},
    });

    // Manually patch start/stop for spying
    const loopOne = manager.getLoop({ name: 'loopOne' })!;
    const loopTwo = manager.getLoop({ name: 'loopTwo' })!;
    (loopOne as any).start = startSpy;
    (loopTwo as any).start = startSpy;
    (loopOne as any).stop = stopSpy;
    (loopTwo as any).stop = stopSpy;

    manager.startAll();
    expect(startSpy).toHaveBeenCalledTimes(2);

    manager.stopAll();
    expect(stopSpy).toHaveBeenCalledTimes(2);
  });

  it('should return undefined for non-existent loop', () => {
    const manager = createLoopManager();
    const loop = manager.getLoop({ name: 'unknownLoop' });
    expect(loop).toBeUndefined();
  });
});
