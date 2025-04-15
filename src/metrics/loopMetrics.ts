// loopMetrics.ts

/**
 * Interface representing the metrics collected for a loop.
 */
export interface LoopMetrics {
  averageFrameTime: number;
  averageFPS: number;
  droppedFrames: number;
  frameCount: number;
  totalTime: number;
}

/**
 * Factory function to create a LoopMetrics object.
 * This function tracks performance metrics such as average frame time,
 * frames per second (FPS), dropped frames, and total execution time.
 *
 * @param maxSamples - The maximum number of frame times to retain for averaging.
 * @returns An object containing methods to record frames and retrieve metrics.
 */
export function createLoopMetrics(maxSamples: number = 100) {
  const frameTimes: number[] = [];
  let lastTimestamp = 0;
  let droppedFrames = 0;
  let frameCount = 0;
  let totalTime = 0;

  /**
   * Records a new frame timestamp and updates metrics accordingly.
   *
   * @param timestamp - The current timestamp in milliseconds.
   */
  function recordFrame(timestamp: number) {
    if (lastTimestamp) {
      const delta = timestamp - lastTimestamp;
      frameTimes.push(delta);
      totalTime += delta;
      frameCount++;

      if (frameTimes.length > maxSamples) {
        frameTimes.shift();
      }

      const avg = getAverageFrameTime();
      if (delta > 2 * avg) {
        droppedFrames++;
      }
    }
    lastTimestamp = timestamp;
  }

  /**
   * Calculates the average frame time based on recorded frame times.
   *
   * @returns The average frame time in milliseconds.
   */
  function getAverageFrameTime(): number {
    if (frameTimes.length === 0) return 0;
    const sum = frameTimes.reduce((a, b) => a + b, 0);
    return sum / frameTimes.length;
  }

  /**
   * Calculates the average frames per second (FPS).
   *
   * @returns The average FPS.
   */
  function getAverageFPS(): number {
    const avgTime = getAverageFrameTime();
    return avgTime ? 1000 / avgTime : 0;
  }

  /**
   * Retrieves the current metrics.
   *
   * @returns An object containing the loop metrics.
   */
  function getMetrics(): LoopMetrics {
    return {
      averageFrameTime: getAverageFrameTime(),
      averageFPS: getAverageFPS(),
      droppedFrames,
      frameCount,
      totalTime,
    };
  }

  /**
   * Resets all metrics to their initial state.
   */
  function reset() {
    frameTimes.length = 0;
    droppedFrames = 0;
    frameCount = 0;
    totalTime = 0;
    lastTimestamp = 0;
  }

  return {
    recordFrame,
    getMetrics,
    reset,
  };
}
