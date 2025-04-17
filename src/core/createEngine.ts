import { LoopConfig } from './types';
import { createLoopManager } from './loopManager';

/**
 * Creates and initializes the core game engine.
 */
export function createEngine({
  loops,
}: {
  /**
   * An array of loop configurations that define the loops to run in the engine.
   * Each loop configuration must contain:
   * - `name`: A unique identifier for the loop (e.g., 'simulation', 'physics', 'rendering').
   * - `interval`: The time interval (in milliseconds) at which the loop will run.
   * - `callback`: The function that will be executed each time the loop runs.
   *
   * This is a **required** parameter. The engine will not function without passing an array of loops.
   * The loops provided will be registered and executed at the specified intervals.
   *
   * Example:
   * ```ts
   * const customLoop = {
   *   name: 'customLoop',
   *   interval: 30, // Custom interval in milliseconds
   *   callback: () => console.log('Custom loop running'),
   * };
   *
   * const engine = createEngine({
   *   loops: [customLoop],
   * });
   * ```
   */
  loops: LoopConfig[];
}) {
  if (!loops || loops.length === 0) {
    throw new Error('loops is required');
  }

  const worker = new Worker(new URL('@/workers/worker.ts', import.meta.url), {
    type: 'module',
  });

  const loopManager = createLoopManager();

  // Register the loops
  for (const loop of loops) {
    loopManager.registerLoop(loop);
  }

  worker.onmessage = (event: MessageEvent<any>) => {
    if (event.data && event.data.type === 'tick') {
      loopManager.startAll();
    }
  };

  return {
    start: () => worker.postMessage({ type: 'setHz', payload: { hz: 60 } }),
    stop: () => worker.terminate(),
    worker,
    loopManager,
  };
}
