import { createLoopManager } from '@/engine';
import { physicsLoop, renderingLoop, simulationLoop } from './loops';

/**
 * Creates and initializes the core game engine.
 * Registers all default loops and starts ticking.
 */
export function createEngine() {
  const worker = new Worker(new URL('@/workers/worker.ts', import.meta.url), {
    type: 'module',
  });

  const loopManager = createLoopManager();

  // Register default loops
  loopManager.registerLoop(simulationLoop);
  loopManager.registerLoop(physicsLoop);
  loopManager.registerLoop(renderingLoop);

  // Listen to ticks from worker
  worker.onmessage = (event) => {
    if (event.data.type === 'tick') {
      loopManager.startAll(); // Or call tickAll() if we separate ticking
    }
  };

  return {
    start: () => worker.postMessage({ type: 'setHz', payload: { hz: 60 } }),
    stop: () => worker.terminate(),
    worker,
    loopManager,
  };
}
