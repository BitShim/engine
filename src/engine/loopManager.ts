import { LoopConfig } from './loopConfig';
import { createLoop } from './loopFactory';

/**
 * Creates a manager for handling multiple loops.
 * Allows registering, ticking, starting, stopping, and querying loops.
 */
export function createLoopManager() {
  const loops = new Map<string, ReturnType<typeof createLoop>>();

  function registerLoop({
    name,
    interval,
    callback,
    reduceWhenUnfocused,
    pauseWhenHidden,
    unfocusedInterval,
  }: LoopConfig) {
    if (loops.has(name)) {
      console.warn(`Loop with name "${name}" is already registered.`);
      return;
    }

    const loopInstance = createLoop({
      name,
      interval,
      callback,
      reduceWhenUnfocused,
      pauseWhenHidden,
      unfocusedInterval,
    });

    loops.set(name, loopInstance);
  }

  function startLoop({ name }: { name: string }) {
    const loop = loops.get(name);
    if (loop) {
      loop.start();
    } else {
      console.warn(`Loop "${name}" not found.`);
    }
  }

  function stopLoop({ name }: { name: string }) {
    const loop = loops.get(name);
    if (loop) {
      loop.stop();
    } else {
      console.warn(`Loop "${name}" not found.`);
    }
  }

  function isRunning({ name }: { name: string }): boolean {
    const loop = loops.get(name);
    return loop ? loop.isRunning() : false;
  }

  function startAll() {
    loops.forEach((loop) => loop.start());
  }

  function stopAll() {
    loops.forEach((loop) => loop.stop());
  }

  // Placeholder for tickAll if you want to process per-tick logic
  function tickAll() {
    // Optional: add hooks or profiling here later
    loops.forEach((loop) => {
      if (!loop.isRunning()) loop.start();
    });
  }

  function getLoop({ name }: { name: string }) {
    return loops.get(name);
  }

  return {
    registerLoop,
    startLoop,
    stopLoop,
    isRunning,
    startAll,
    stopAll,
    tickAll,
    getLoop,
  };
}
