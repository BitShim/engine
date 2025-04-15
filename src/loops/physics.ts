import { createLoop } from '@/engine';

/**
 * Physics loop responsible for processing physics calculations
 * at a fixed interval.
 */
export const physicsLoop = createLoop({
  name: 'physics',
  interval: 20, // 50 updates per second
  callback: () => {
    // TODO: Implement physics update logic
  },
});
