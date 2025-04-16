import { physicsLoop, renderingLoop, simulationLoop } from '@/loops';
import { LoopConfig } from './types';
import { createLoopManager } from './loopManager';

/**
 * Creates and initializes the core game engine.
 * Registers the default loops unless overridden.
 */
export function createEngine({
  loops = [simulationLoop, physicsLoop, renderingLoop],
}: {
  /**
   * An optional list of loop configurations to override the default engine loops.
   *
   * If not provided, the engine registers these three default loops:
   * - `simulationLoop`
   * - `physicsLoop`
   * - `renderingLoop`
   *
   * You can override this behavior by passing your own list of loops:
   *
   * ```ts
   * const engine = createEngine({
   *   loops: [myCustomLoop],
   * });
   * ```
   *
   * You can also mix defaults with your own:
   *
   * ```ts
   * import {
   *   simulationLoop,
   *   createEngine,
   * } from 'bitshim-engine';
   *
   * const engine = createEngine({
   *   loops: [simulationLoop, myCustomLoop],
   * });
   * ```
   */
  loops?: LoopConfig[];
} = {}) {
  const worker = new Worker(new URL('@/workers/worker.ts', import.meta.url), {
    type: 'module',
  });

  const loopManager = createLoopManager();

  for (const loop of loops) {
    loopManager.registerLoop(loop);
  }

  worker.onmessage = (event) => {
    if (event.data.type === 'tick') {
      loopManager.startAll(); // Optional: expose this if needed
    }
  };

  return {
    start: () => worker.postMessage({ type: 'setHz', payload: { hz: 60 } }),
    stop: () => worker.terminate(),
    worker,
    loopManager,
  };
}
