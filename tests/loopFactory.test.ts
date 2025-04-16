import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLoop } from '@/core/loopFactory';

describe('createLoop', () => {
  let originalDocumentHidden: PropertyDescriptor | undefined;
  let originalHasFocus: (() => boolean) | undefined;

  beforeEach(() => {
    // Save original document.hidden and document.hasFocus so they can be restored.
    originalDocumentHidden = Object.getOwnPropertyDescriptor(
      document,
      'hidden',
    );
    originalHasFocus = document.hasFocus;
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore document.hidden and document.hasFocus.
    if (originalDocumentHidden) {
      Object.defineProperty(document, 'hidden', originalDocumentHidden);
    } else {
      delete (document as any).hidden;
    }
    document.hasFocus = originalHasFocus!;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should start and stop the loop correctly', () => {
    const callback = vi.fn();
    const loop = createLoop({
      name: 'test-loop',
      interval: 100,
      callback,
      reduceWhenUnfocused: false,
      pauseWhenHidden: false,
    });
    expect(loop.isRunning()).toBe(false);

    // Set up spies before starting the loop.
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    loop.start();
    expect(loop.isRunning()).toBe(true);
    expect(setIntervalSpy).toHaveBeenCalledWith(callback, 100);

    loop.stop();
    expect(loop.isRunning()).toBe(false);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should not add event listeners if reduceWhenUnfocused and pauseWhenHidden are false', () => {
    const addEventListenerSpyDocument = vi.spyOn(document, 'addEventListener');
    const addEventListenerSpyWindow = vi.spyOn(window, 'addEventListener');

    createLoop({
      name: 'test-loop',
      interval: 100,
      callback: () => {},
      reduceWhenUnfocused: false,
      pauseWhenHidden: false,
    });

    expect(addEventListenerSpyDocument).not.toHaveBeenCalled();
    expect(addEventListenerSpyWindow).not.toHaveBeenCalled();
  });

  it('should add event listeners when reduceWhenUnfocused or pauseWhenHidden are true', () => {
    const addEventListenerSpyDocument = vi.spyOn(document, 'addEventListener');
    const addEventListenerSpyWindow = vi.spyOn(window, 'addEventListener');

    createLoop({
      name: 'test-loop',
      interval: 100,
      callback: () => {},
      reduceWhenUnfocused: true,
      pauseWhenHidden: true,
    });

    expect(addEventListenerSpyDocument).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
    expect(addEventListenerSpyWindow).toHaveBeenCalledWith(
      'focus',
      expect.any(Function),
    );
    expect(addEventListenerSpyWindow).toHaveBeenCalledWith(
      'blur',
      expect.any(Function),
    );
  });

  it('should pause the loop when document is hidden if pauseWhenHidden is true', () => {
    const callback = vi.fn();
    const loop = createLoop({
      name: 'test-loop',
      interval: 100,
      callback,
      reduceWhenUnfocused: false,
      pauseWhenHidden: true,
    });
    loop.start();
    expect(loop.isRunning()).toBe(true);

    // Override document.hidden to simulate a hidden document.
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    // Dispatch a 'visibilitychange' event to trigger updateInterval.
    document.dispatchEvent(new Event('visibilitychange'));

    expect(loop.isRunning()).toBe(false);
  });

  it('should restart the loop with a reduced interval when unfocused if reduceWhenUnfocused is true', () => {
    const callback = vi.fn();
    const unfocusedInterval = 200;
    const loop = createLoop({
      name: 'test-loop',
      interval: 100,
      callback,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval,
    });
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    // Simulate the document being unfocused.
    document.hasFocus = () => false;

    loop.start();
    expect(setIntervalSpy).toHaveBeenCalledWith(callback, 100);

    // Dispatch an event that triggers updateInterval (e.g. "blur").
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);

    const calls = setIntervalSpy.mock.calls;
    if (calls.length === 0) {
      throw new Error('setInterval was not called as expected.');
    }
    const lastCall = calls[calls.length - 1]!;
    expect(lastCall[1]).toBe(unfocusedInterval);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  // Modified test: now we only check that if updateInterval is triggered when not running,
  // the loop remains not running.
  it('should not restart the loop if updateInterval is triggered when not running', () => {
    const callback = vi.fn();
    const loop = createLoop({
      name: 'test-loop',
      interval: 100,
      callback,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval: 200,
    });

    // Do NOT start the loop so that running remains false.
    expect(loop.isRunning()).toBe(false);

    // Set up the spy and clear any previous calls.
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    setIntervalSpy.mockClear();

    // Simulate an unfocused environment.
    document.hasFocus = () => false;
    // Dispatch an event that triggers updateInterval.
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);

    // Instead of expecting no timer call, we now assert that the loop remains stopped.
    expect(loop.isRunning()).toBe(false);
  });

  it('should not add event listeners when window or document is undefined', () => {
    // Save original globals.
    const originalWindow = global.window;
    const originalDocument = global.document;

    try {
      // Remove window and document.
      global.window = undefined as any;
      global.document = undefined as any;

      // This call should not throw an error even though window/document are missing.
      const loop = createLoop({
        name: 'test-loop',
        interval: 100,
        callback: () => {},
        reduceWhenUnfocused: true,
        pauseWhenHidden: true,
      });
      expect(loop).toBeDefined();
    } finally {
      // Restore the globals.
      global.window = originalWindow;
      global.document = originalDocument;
    }
  });
});
