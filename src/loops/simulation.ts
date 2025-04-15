import { createLoop } from '@/engine';

/**
 * Simulation loop responsible for updating game logic,
 * such as AI, pathfinding, and world state.
 */
export const simulationLoop = createLoop({
  name: 'simulation',
  interval: 16, // Approximately 60 updates per second
  callback: () => {
    // TODO: Implement simulation update logic
  },
});
