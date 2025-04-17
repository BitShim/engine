import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLoop } from '@/core/loopFactory';

/**
 * This test suite exercises **all** branches in `createLoop`:
 * 1. normal start/stop
 * 2. listeners added / not added
 * 3. pause-on-hidden true & false paths
 * 4. reduce‑when‑unfocused true & false, focused & unfocused
 * 5. duplicate‑start guard (`if (!running)` false branch)
 * 6. default `unfocusedInterval` parameter
 * 7. environment with missing `window`/`document`
 * 8. branch where `pauseWhenHidden` true but `hidden` is false
 */

describe('createLoop', () => {
  let origHidden: PropertyDescriptor | undefined;
  let origHasFocus: (() => boolean) | undefined;

  beforeEach(() => {
    origHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
    origHasFocus = document.hasFocus;
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (origHidden) {
      Object.defineProperty(document, 'hidden', origHidden);
    } else {
      delete (document as any).hidden;
    }
    document.hasFocus = origHasFocus!;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts and stops correctly', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'base',
      interval: 60,
      callback: cb,
      reduceWhenUnfocused: false,
      pauseWhenHidden: false,
    });
    const setInt = vi.spyOn(window, 'setInterval');
    const clrInt = vi.spyOn(window, 'clearInterval');

    loop.start();
    expect(loop.isRunning()).toBe(true);
    expect(setInt).toHaveBeenCalledWith(cb, 60);

    loop.stop();
    expect(loop.isRunning()).toBe(false);
    expect(clrInt).toHaveBeenCalled();
  });

  it('does not schedule a second timer if start() called while running', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'dup',
      interval: 40,
      callback: cb,
      reduceWhenUnfocused: false,
      pauseWhenHidden: false,
    });
    const spy = vi.spyOn(window, 'setInterval');
    loop.start();
    const first = spy.mock.calls.length;
    loop.start();
    expect(spy.mock.calls.length).toBe(first); // no new timer
  });

  it('adds listeners when either flag true and skips otherwise', () => {
    const docSpy = vi.spyOn(document, 'addEventListener');
    const winSpy = vi.spyOn(window, 'addEventListener');

    createLoop({
      name: 'no-listeners',
      interval: 50,
      callback: () => {},
      reduceWhenUnfocused: false,
      pauseWhenHidden: false,
    });
    expect(docSpy).not.toHaveBeenCalled();

    createLoop({
      name: 'listeners',
      interval: 50,
      callback: () => {},
      reduceWhenUnfocused: true,
      pauseWhenHidden: true,
    });
    expect(docSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
    expect(winSpy).toHaveBeenCalledWith('blur', expect.any(Function));
  });

  it('pauses when hidden (pauseWhenHidden true & hidden true)', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'hidden',
      interval: 70,
      callback: cb,
      reduceWhenUnfocused: false,
      pauseWhenHidden: true,
    });
    loop.start();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(loop.isRunning()).toBe(false);
  });

  it('restarts at reduced interval when unfocused', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'unfocused',
      interval: 100,
      callback: cb,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval: 250,
    });
    const setInt = vi.spyOn(window, 'setInterval');
    document.hasFocus = () => false;

    loop.start();
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);

    const [, delay] = setInt.mock.calls.pop()!;
    expect(delay).toBe(250);
  });

  it('keeps running (and restarts) when pauseWhenHidden true but document is visible', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'visible',
      interval: 80,
      callback: cb,
      reduceWhenUnfocused: false,
      pauseWhenHidden: true,
    });

    const setInt = vi.spyOn(window, 'setInterval');
    loop.start();
    const before = setInt.mock.calls.length;
    // document.hidden defaults to false -> visible
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(1);
    const after = setInt.mock.calls.length;
    // restart should add another setInterval call
    expect(after).toBeGreaterThan(before);
    expect(loop.isRunning()).toBe(true);
  });

  it('uses default unfocusedInterval (1000/30) when not specified', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'default-fps',
      interval: 120,
      callback: cb,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
    });
    const setInt = vi.spyOn(window, 'setInterval');
    document.hasFocus = () => false;
    loop.start();
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);
    const [, delay] = setInt.mock.calls.pop()!;
    expect(delay).toBeCloseTo(1000 / 30);
  });

  it('keeps base interval when focused even if reduceWhenUnfocused is true', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'focused',
      interval: 150,
      callback: cb,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval: 500,
    });
    const setInt = vi.spyOn(window, 'setInterval');

    document.hasFocus = () => true;
    loop.start();
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(1);
    const [, delay] = setInt.mock.calls.pop()!;
    expect(delay).toBe(150);
  });

  it('updateInterval does nothing harmful when loop not running', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'not-running',
      interval: 90,
      callback: cb,
      reduceWhenUnfocused: true,
      pauseWhenHidden: false,
      unfocusedInterval: 333,
    });
    document.hasFocus = () => false;
    window.dispatchEvent(new Event('blur'));
    expect(loop.isRunning()).toBe(false);
  });

  it('gracefully handles absence of window/document', () => {
    const origWin = global.window;
    const origDoc = global.document;
    try {
      (global as any).window = undefined;
      (global as any).document = undefined;

      expect(() =>
        createLoop({
          name: 'no-env',
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

  /**
   * Covers branch where `document?.hidden` evaluates to **undefined** (nullish)
   * so the `?? false` default is used.  This is the only branch (line 19)
   * still un‑hit in coverage.
   */
  it('treats undefined document.hidden as not hidden', () => {
    const cb = vi.fn();
    const loop = createLoop({
      name: 'undef-hidden',
      interval: 110,
      callback: cb,
      reduceWhenUnfocused: false,
      pauseWhenHidden: true, // flag true so path executes
    });

    // Override document.hidden getter to return undefined
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => undefined,
    });

    loop.start();
    // Dispatch visibilitychange to invoke updateInterval; because hidden === undefined,
    // pauseWhenHidden should *not* stop the loop.
    document.dispatchEvent(new Event('visibilitychange'));
    expect(loop.isRunning()).toBe(true);
  });
});
