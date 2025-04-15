import { LoopConfig } from '@/engine';

/**
 * Physics loop responsible for deterministic and fixed-rate
 * simulation, useful for collisions, forces, and movement resolution.
 */
export const physicsLoop: LoopConfig = {
  name: 'physics',
  interval: 20, // 50 updates per second
  callback: () => {
    // TODO: Implement physics update logic
  },
};
