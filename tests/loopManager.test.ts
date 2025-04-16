import { createLoopManager } from '@/core';
import { describe, expect, it, vi } from 'vitest';

describe('Loop Manager', () => {
  it('should register and manage loops correctly', () => {
    const manager = createLoopManager();
    const loopConfig = {
      name: 'testLoop',
      interval: 100,
      callback: vi.fn(),
    };

    manager.registerLoop(loopConfig);
    expect(manager.isRunning({ name: 'testLoop' })).toBe(false);

    manager.startLoop({ name: 'testLoop' });
    expect(manager.isRunning({ name: 'testLoop' })).toBe(true);

    manager.stopLoop({ name: 'testLoop' });
    expect(manager.isRunning({ name: 'testLoop' })).toBe(false);
  });

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
