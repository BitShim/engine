/**
 * Represents a generic loop that can be started and stopped.
 */
export interface Loop {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
}

/**
 * Configuration options for creating a loop.
 */
interface LoopConfig {
  name: string;
  interval: number; // in milliseconds
  callback: () => void;
}

/**
 * Factory function to create a loop with the specified configuration.
 *
 * @param config - The configuration for the loop.
 * @returns An object representing the loop with control methods.
 */
export function createLoop(config: LoopConfig): Loop {
  let timerId: ReturnType<typeof setInterval> | null = null;
  let running = false;

  return {
    start: () => {
      if (!running) {
        timerId = setInterval(config.callback, config.interval);
        running = true;
      }
    },
    stop: () => {
      if (running && timerId !== null) {
        clearInterval(timerId);
        timerId = null;
        running = false;
      }
    },
    isRunning: () => running,
  };
}
