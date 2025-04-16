// tests/loopFactory.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLoop } from '@/core/loopFactory';

describe('createLoop', () => {
  let origHiddenDesc: PropertyDescriptor | undefined;
  let origHasFocus: (() => boolean) | undefined;

  beforeEach(() => {
    // Save original document.hidden and document.hasFocus so we can restore them
    origHiddenDesc = Object.getOwnPropertyDescriptor(document, 'hidden');
    origHasFocus = document.hasFocus;
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore document.hidden and document.hasFocus
    if (origHiddenDesc) {
      Object.defineProperty(document, 'hidden', origHiddenDesc);
    } else {
      delete (document as any).hidden;
    }
    document.hasFocus = origHasFocus!;
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

    // Initially not running
    expect(loop.isRunning()).toBe(false);

    // Spy before starting/stopping
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    loop.start();
    expect(loop.isRunning()).toBe(true);
    expect(setIntervalSpy).toHaveBeenCalledWith(callback, 100);

    loop.stop();
    expect(loop.isRunning()).toBe(false);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should not add event listeners if both flags are false', () => {
    const docSpy = vi.spyOn(document, 'addEventListener');
    const winSpy = vi.spyOn(window, 'addEventListener');

    createLoop({
      name: 'test-loop',
      interval: 100,
      callback: () => {},
      reduceWhenUnfocused: false,
      pauseWhenHidden: false,
    });

    expect(docSpy).not.toHaveBeenCalled();
    expect(winSpy).not.toHaveBeenCalled();
  });

  it('should add event listeners when flags are true', () => {
    const docSpy = vi.spyOn(document, 'addEventListener');
    const winSpy = vi.spyOn(window, 'addEventListener');

    createLoop({
      name: 'test-loop',
      interval: 100,
      callback: () => {},
      reduceWhenUnfocused: true,
      pauseWhenHidden: true,
    });

    expect(docSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
    expect(winSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(winSpy).toHaveBeenCalledWith('blur', expect.any(Function));
  });

  it('should pause when hidden if pauseWhenHidden is true', () => {
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

    // Simulate hidden document
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(loop.isRunning()).toBe(false);
  });

  it('should restart with reduced interval when unfocused if reduceWhenUnfocused is true', () => {
    const callback = vi.fn();
    const loop = createLoop({
      name: 'test-loop',
      interval: 100,
      callback,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval: 200,
    });
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    // Simulate unfocused document
    document.hasFocus = () => false;

    loop.start();
    expect(setIntervalSpy).toHaveBeenCalledWith(callback, 100);

    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);

    const calls = setIntervalSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [, lastDelay] = calls[calls.length - 1]!;
    expect(lastDelay).toBe(200);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should not restart if updateInterval triggers when not running', () => {
    const callback = vi.fn();
    const loop = createLoop({
      name: 'test-loop',
      interval: 100,
      callback,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval: 200,
    });

    // Never start, so running remains false
    expect(loop.isRunning()).toBe(false);

    // Spy but we won’t assert on it here
    vi.spyOn(window, 'setInterval');

    // Simulate unfocused
    document.hasFocus = () => false;
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);

    // Loop should remain stopped
    expect(loop.isRunning()).toBe(false);
  });

  it('uses default unfocusedInterval of 1000/30 when omitted', () => {
    const callback = vi.fn();
    const defaultUnfocused = 1000 / 30;
    const loop = createLoop({
      name: 'test-loop',
      interval: 120,
      callback,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      // unfocusedInterval omitted
    });

    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    document.hasFocus = () => false;

    loop.start();
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);

    const calls = setIntervalSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [, lastDelay] = calls[calls.length - 1]!;
    expect(lastDelay).toBe(defaultUnfocused);
  });

  it('keeps base interval when focused even if reduceWhenUnfocused is true', () => {
    const callback = vi.fn();
    const loop = createLoop({
      name: 'test-loop',
      interval: 150,
      callback,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval: 500,
    });

    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    document.hasFocus = () => true;

    loop.start();
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);

    const calls = setIntervalSpy.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [, lastDelay] = calls[calls.length - 1]!;
    expect(lastDelay).toBe(150);
  });

  it('does not throw if window or document is undefined', () => {
    const origWin = global.window;
    const origDoc = global.document;

    try {
      // Remove globals
      (global as any).window = undefined;
      (global as any).document = undefined;

      expect(() =>
        createLoop({
          name: 'test',
          interval: 100,
          callback: () => {},
          reduceWhenUnfocused: true,
          pauseWhenHidden: true,
        }),
      ).not.toThrow();
    } finally {
      global.window = origWin;
      global.document = origDoc;
    }
  });
});
