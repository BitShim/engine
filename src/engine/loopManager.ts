/**
 * Loop Manager to coordinate the execution of simulation, physics, and rendering loops.
 */

import { simulationLoop } from '@/loops/simulation';
import { physicsLoop } from '@/loops/physics';
import { renderingLoop } from '@/loops/rendering';

type LoopType = 'simulation' | 'physics' | 'rendering';

interface LoopConfig {
  type: LoopType;
  interval: number;
  lastExecuted: number;
  loop: {
    start: () => void;
    stop: () => void;
    isRunning: () => boolean;
  };
}

const loops: LoopConfig[] = [
  {
    type: 'simulation',
    interval: 16, // 60 times per second
    lastExecuted: 0,
    loop: simulationLoop,
  },
  {
    type: 'physics',
    interval: 20, // 50 times per second
    lastExecuted: 0,
    loop: physicsLoop,
  },
  {
    type: 'rendering',
    interval: 16, // 60 times per second
    lastExecuted: 0,
    loop: renderingLoop,
  },
];

/**
 * Initializes the loop manager by starting all loops.
 */
export function startLoops() {
  loops.forEach(({ loop }) => loop.start());
}

/**
 * Stops all loops.
 */
export function stopLoops() {
  loops.forEach(({ loop }) => loop.stop());
}
