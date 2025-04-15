/**
 * Web Worker that sends tick messages at regular intervals.
 * This can be used to drive engine loops like simulation, physics, and rendering.
 */

// Default tick interval in milliseconds
let interval = 16; // Approximately 60 FPS
let timerId: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the tick loop with the specified interval.
 * @param newInterval - The interval in milliseconds.
 */
function startTick(newInterval: number) {
  if (timerId !== null) {
    clearInterval(timerId);
  }
  interval = newInterval;
  timerId = setInterval(() => {
    postMessage({ type: 'tick', timestamp: performance.now() });
  }, interval);
}

/**
 * Stops the tick loop.
 */
function stopTick() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

// Listen for messages from the main thread to control the tick loop
self.onmessage = (event: MessageEvent) => {
  const { type, interval: newInterval } = event.data;
  switch (type) {
    case 'start':
      startTick(newInterval ?? interval);
      break;
    case 'stop':
      stopTick();
      break;
    default:
      // Unknown message type
      break;
  }
};
