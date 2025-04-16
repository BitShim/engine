import { LoopConfig } from '@/core';

/**
 * Simulation loop responsible for core game logic,
 * such as AI, state updates, and world progression.
 */
export const simulationLoop: LoopConfig = {
  name: 'simulation',
  interval: 16, // ~60 updates per second
  callback: () => {
    // TODO: Implement simulation logic
  },
};
