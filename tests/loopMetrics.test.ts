import { describe, it, expect } from 'vitest';
import { createLoopMetrics } from '@/metrics/loopMetrics';

describe('LoopMetrics', () => {
  it('should record frames and calculate average frame time and FPS', () => {
    const metrics = createLoopMetrics();
    metrics.recordFrame(1000); // 1st call, no delta
    metrics.recordFrame(1016); // delta = 16
    metrics.recordFrame(1032); // delta = 16

    const result = metrics.getMetrics();

    expect(result.frameCount).toBe(3); // All calls counted
    expect(result.totalTime).toBe(32); // 16 + 16
    expect(result.averageFrameTime).toBeCloseTo(16, 1);
    expect(result.averageFPS).toBeCloseTo(62.5, 1);
  });

  it('should drop frames if delta is more than 2x average', () => {
    const metrics = createLoopMetrics();
    metrics.recordFrame(1000); // first
    metrics.recordFrame(1016); // +16
    metrics.recordFrame(1032); // +16
    metrics.recordFrame(1100); // +68 (drop)

    const result = metrics.getMetrics();

    expect(result.frameCount).toBe(4);
    expect(result.droppedFrames).toBe(1); // 68 > 2 * avg(16)
  });

  it('should cap frame samples by maxSamples', () => {
    const metrics = createLoopMetrics(5); // max 5 frameTimes
    metrics.recordFrame(1000); // 0
    metrics.recordFrame(1010); // +10
    metrics.recordFrame(1020); // +10
    metrics.recordFrame(1030); // +10
    metrics.recordFrame(1040); // +10
    metrics.recordFrame(1050); // +10
    metrics.recordFrame(1060); // +10

    const result = metrics.getMetrics();
    expect(result.frameCount).toBe(7); // 7 record calls
    expect(result.averageFrameTime).toBe(10); // last 5 used
  });

  it('should reset all internal state', () => {
    const metrics = createLoopMetrics();
    metrics.recordFrame(1000);
    metrics.recordFrame(1016);
    metrics.reset();

    const result = metrics.getMetrics();
    expect(result.frameCount).toBe(0);
    expect(result.droppedFrames).toBe(0);
    expect(result.totalTime).toBe(0);
    expect(result.averageFrameTime).toBe(0);
    expect(result.averageFPS).toBe(0);
  });
});
