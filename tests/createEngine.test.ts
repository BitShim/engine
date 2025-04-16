import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { simulationLoop, physicsLoop, renderingLoop } from '@/loops';

// Create spies for the loop manager methods.
const registerLoopMock = vi.fn();
const startAllMock = vi.fn();

// Mock the module that creates the loop manager.
vi.mock('@/core/loopManager', () => {
  return {
    createLoopManager: () => ({
      registerLoop: registerLoopMock,
      startAll: startAllMock,
    }),
  };
});

// Import the engine creation function after setting up the loop manager mock.
import { createEngine } from '@/core/createEngine';

/**
 * A fake Worker factory function that creates a worker-like object.
 * It returns a plain object with the minimal Worker API, without using classes.
 */
function fakeWorkerFactory(url: string, options: any) {
  const worker: any = {
    messages: [] as unknown[],
    terminated: false,
    postMessage(msg: any) {
      this.messages.push(msg);
    },
    terminate() {
      this.terminated = true;
    },
  };

  // Create an accessor for the onmessage property.
  let _onmessage: ((event: MessageEvent<any>) => void) | null = null;
  Object.defineProperty(worker, 'onmessage', {
    get() {
      return _onmessage;
    },
    set(fn: ((event: MessageEvent<any>) => void) | null) {
      _onmessage = fn;
    },
    configurable: true,
    enumerable: true,
  });

  return worker;
}

describe('createEngine', () => {
  beforeEach(() => {
    registerLoopMock.mockReset();
    startAllMock.mockReset();
    // Override the global Worker constructor with our fakeWorkerFactory.
    global.Worker = fakeWorkerFactory as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers default loops when no custom loops are provided', () => {
    createEngine();
    // Expect the three default loops to be registered.
    expect(registerLoopMock).toHaveBeenCalledTimes(3);
    expect(registerLoopMock).toHaveBeenNthCalledWith(1, simulationLoop);
    expect(registerLoopMock).toHaveBeenNthCalledWith(2, physicsLoop);
    expect(registerLoopMock).toHaveBeenNthCalledWith(3, renderingLoop);
  });

  it('registers custom loops when provided', () => {
    // Provide a complete LoopConfig object with the required properties.
    const customLoop = {
      name: 'customLoop',
      interval: 50, // required property for LoopConfig
      callback: vi.fn(), // required callback function
      update: vi.fn(),
    };
    createEngine({ loops: [customLoop] });
    // Only the custom loop should be registered.
    expect(registerLoopMock).toHaveBeenCalledTimes(1);
    expect(registerLoopMock).toHaveBeenCalledWith(customLoop);
  });

  it('calls startAll on receiving a tick message', () => {
    const engine = createEngine();
    // Simulate a tick message from the worker.
    const tickEvent = new MessageEvent('message', { data: { type: 'tick' } });
    engine.worker.onmessage && engine.worker.onmessage(tickEvent);
    expect(startAllMock).toHaveBeenCalled();
  });

  it('does not call startAll when receiving a non-tick message', () => {
    const engine = createEngine();
    // Simulate an event with an unexpected type.
    const nonTickEvent = new MessageEvent('message', {
      data: { type: 'notTick' },
    });
    engine.worker.onmessage && engine.worker.onmessage(nonTickEvent);
    expect(startAllMock).not.toHaveBeenCalled();

    // Simulate an event with falsy data.
    const falsyEvent = new MessageEvent('message', { data: null });
    engine.worker.onmessage && engine.worker.onmessage(falsyEvent);
    expect(startAllMock).not.toHaveBeenCalled();
  });

  it('start method posts setHz message to the worker', () => {
    const engine = createEngine();
    engine.start();
    // Cast worker to any to access the custom "messages" property.
    expect((engine.worker as any).messages).toContainEqual({
      type: 'setHz',
      payload: { hz: 60 },
    });
  });

  it('stop method terminates the worker', () => {
    const engine = createEngine();
    engine.stop();
    // Cast worker to any to access the custom "terminated" property.
    expect((engine.worker as any).terminated).toBe(true);
  });
});
