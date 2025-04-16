import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoop } from '@/core';
import { physicsLoop, renderingLoop, simulationLoop } from '@/loops';

beforeEach(() => {
  vi.useFakeTimers(); // Enable fake timers for this suite
});

describe('Default Loops', () => {
  it('should run the simulation loop callback when started', () => {
    const callback = vi.fn();
    const loop = createLoop({ ...simulationLoop, callback });

    loop.start();
    expect(loop.isRunning()).toBe(true);

    vi.advanceTimersByTime(simulationLoop.interval);
    expect(callback).toHaveBeenCalled();

    loop.stop();
    expect(loop.isRunning()).toBe(false);
  });

  it('should run the physics loop callback when started', () => {
    const callback = vi.fn();
    const loop = createLoop({ ...physicsLoop, callback });

    loop.start();
    expect(loop.isRunning()).toBe(true);

    vi.advanceTimersByTime(physicsLoop.interval);
    expect(callback).toHaveBeenCalled();

    loop.stop();
    expect(loop.isRunning()).toBe(false);
  });

  it('should run the rendering loop callback when started', () => {
    const callback = vi.fn();
    const loop = createLoop({ ...renderingLoop, callback });

    loop.start();
    expect(loop.isRunning()).toBe(true);

    vi.advanceTimersByTime(renderingLoop.interval);
    expect(callback).toHaveBeenCalled();

    loop.stop();
    expect(loop.isRunning()).toBe(false);
  });
});
