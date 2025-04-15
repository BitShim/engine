import { LoopConfig } from '@/types';

/**
 * Rendering loop responsible for visual updates and redraws.
 * It runs at full rate when in focus, slows down when unfocused,
 * and stops completely when the tab is hidden.
 */
export const renderingLoop: LoopConfig = {
  name: 'rendering',
  interval: 16, // 60 FPS
  callback: () => {
    // TODO: Implement rendering logic
  },
  reduceWhenUnfocused: true,
  pauseWhenHidden: true,
  unfocusedInterval: 1000 / 30, // 30 FPS
};
