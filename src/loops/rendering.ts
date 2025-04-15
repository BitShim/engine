import { createLoop } from '@/engine/loopFactory';

/**
 * Rendering loop responsible for updating the visual representation
 * of the game. Adjusts its frequency based on window focus and visibility.
 */
export const renderingLoop = createLoop({
  name: 'rendering',
  interval: 16, // Approximately 60 frames per second
  callback: () => {
    // TODO: Implement rendering logic
  },
});
