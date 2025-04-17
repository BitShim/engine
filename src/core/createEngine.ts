import { LoopConfig } from './types';
import { createLoopManager } from './loopManager';

/**
 * Creates and initializes the core game engine.
 *
 * @param loops - An array of loop configurations to register:
 *   • simulation loop: core game logic (~60 fps)
 *   • physics loop: fixed-rate physics updates (e.g., 50 ms interval)
 *   • rendering loop: visual updates at full rate when focused, throttled when unfocused, paused when hidden
 *
 * @returns An engine handle with:
 *   - start(): begin the worker at 60 Hz
 *   - stop(): terminate the worker
 *   - worker: underlying Web Worker instance
 *   - loopManager: manager for controlling registered loops
 *
 * @example
 * ```ts
 * import { createEngine, LoopConfig } from '@bitshim/engine';
 *
 * // Define your loops
 * function handleSimulationTick() {
 *   console.log('Running simulation step');
 * }
 *
 * function handlePhysicsTick() {
 *   console.log('Executing physics update');
 * }
 *
 * function handleRenderTick() {
 *   console.log('Rendering scene frame');
 * }
 *
 * // Instantiate the engine with inline loop configs
 * const engine = createEngine({
 *   loops: [
 *     {
 *       name: 'simulation',
 *       interval: 16,
 *       callback: handleSimulationTick
 *     },
 *     {
 *       name: 'physics',
 *       interval: 50,
 *       callback: handlePhysicsTick
 *     },
 *     {
 *       name: 'rendering',
 *       interval: 16,
 *       callback: handleRenderTick,
 *       reduceWhenUnfocused: true,
 *       pauseWhenHidden: true,
 *       unfocusedInterval: 1000 / 30, // ~30 fps when unfocused
 *     },
 *   ],
 * });
 * ```
 */
export function createEngine({
  loops,
  hz = 60,
  autoStart = true,
}: {
  /** Array of loop configurations (name, interval in ms, and callback) to register */
  loops: LoopConfig[];
  /** Desired worker tick rate in Hz (default: 60) */
  hz?: number;
  /** Auto-start on creation (default: true) */
  autoStart?: boolean;
}) {
  if (!loops || loops.length === 0) {
    throw new Error('loops is required');
  }

  const worker = new Worker(new URL('@/workers/worker.ts', import.meta.url), {
    type: 'module',
  });

  const loopManager = createLoopManager();

  for (const loop of loops) {
    loopManager.registerLoop(loop);
  }

  worker.onmessage = (event: MessageEvent<any>) => {
    if (event.data && event.data.type === 'tick') {
      loopManager.startAll();
    }
  };

  const api = {
    start: () => worker.postMessage({ type: 'setHz', payload: { hz } }),
    stop: () => worker.terminate(),
    worker,
    loopManager,
  };

  // Optionally start immediately
  if (autoStart) api.start();

  return api;
}
