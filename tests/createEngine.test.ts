// tests/createEngine.integration.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createEngine } from '@/core/createEngine';

describe('createEngine – integration with Worker and LoopManager', () => {
  const dummyLoop = {
    name: 'dummy',
    interval: 10,
    callback: vi.fn(),
  };

  /* ---------- happy‑path behaviour ---------- */

  it('start() sends the correct setHz message to the worker', () => {
    const { start, worker } = createEngine({ loops: [dummyLoop] });

    start();

    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'setHz',
      payload: { hz: 60 },
    });
  });

  it('stop() terminates the worker', () => {
    const { stop, worker } = createEngine({ loops: [dummyLoop] });

    stop();

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('a tick message from the worker triggers loopManager.startAll()', () => {
    const engine = createEngine({ loops: [dummyLoop] });
    const spy = vi.spyOn(engine.loopManager, 'startAll');

    // Simulate an incoming tick
    engine.worker.onmessage?.({ data: { type: 'tick' } } as MessageEvent);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('non‑tick messages are ignored by the onmessage handler', () => {
    const engine = createEngine({ loops: [dummyLoop] });
    const spy = vi.spyOn(engine.loopManager, 'startAll');

    engine.worker.onmessage?.({
      data: { type: 'something‑else' },
    } as MessageEvent);

    expect(spy).not.toHaveBeenCalled();
  });

  it('ignores a message whose data is undefined', () => {
    const engine = createEngine({ loops: [dummyLoop] });
    const spy = vi.spyOn(engine.loopManager, 'startAll');

    engine.worker.onmessage?.({} as MessageEvent);

    expect(spy).not.toHaveBeenCalled();
  });

  it('ignores a message whose data has no type property', () => {
    const engine = createEngine({ loops: [dummyLoop] });
    const spy = vi.spyOn(engine.loopManager, 'startAll');

    engine.worker.onmessage?.({
      data: { someOtherField: 123 },
    } as MessageEvent);

    expect(spy).not.toHaveBeenCalled();
  });

  /* ---------- guard clause coverage ---------- */

  it('throws if loops is an empty array', () => {
    expect(() => createEngine({ loops: [] })).toThrow('loops is required');
  });

  it('throws if loops is explicitly undefined', () => {
    expect(() =>
      createEngine({ loops: undefined as unknown as never }),
    ).toThrow('loops is required');
  });

  it('throws if the loops property is omitted entirely', () => {
    // Force‑cast so TypeScript lets us pass an object with no loops key
    expect(() => (createEngine as any)({})).toThrow('loops is required');
  });
});
