/**
 * Factory function to create a loop with the specified configuration.
 */
export function createLoop({
  name,
  interval,
  callback,
  reduceWhenUnfocused,
  pauseWhenHidden,
  unfocusedInterval = 1000 / 30, // default: 30fps
}: {
  /** Optional identifier for the loop. */
  name?: string;
  /** Time interval in milliseconds between each callback execution. */
  interval: number;
  /** Function to be called at each interval. */
  callback: () => void;
  /** Whether to reduce the interval when window loses focus. */
  reduceWhenUnfocused?: boolean;
  /** Whether to pause the loop when the tab becomes hidden. */
  pauseWhenHidden?: boolean;
  /** Interval to use when unfocused (only if reduceWhenUnfocused is true). */
  unfocusedInterval?: number;
}) {
  let timerId: ReturnType<typeof setInterval> | null = null;
  let running = false;
  let currentInterval = interval;

  function updateInterval() {
    const hidden = document?.hidden ?? false;
    const unfocused =
      typeof document.hasFocus === 'function' && !document.hasFocus();

    // Should we stop completely?
    if (pauseWhenHidden && hidden) {
      stop();
      return;
    }

    // Determine appropriate interval
    currentInterval = interval;
    if (reduceWhenUnfocused && unfocused) {
      currentInterval = unfocusedInterval;
    }

    if (running) {
      restart();
    }
  }

  function start() {
    if (!running) {
      timerId = setInterval(callback, currentInterval);
      running = true;
    }
  }

  function stop() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    running = false;
  }

  function restart() {
    stop();
    start();
  }

  // Only add listeners if needed
  if (reduceWhenUnfocused || pauseWhenHidden) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', updateInterval);
      window.addEventListener('focus', updateInterval);
      window.addEventListener('blur', updateInterval);
    }
  }

  return {
    /** Starts the loop if it's not already running. */
    start,
    /** Stops the loop if it's currently running. */
    stop,
    /** Checks if the loop is currently running. */
    isRunning: () => running,
  };
}
