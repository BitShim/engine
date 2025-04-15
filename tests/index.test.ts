import { describe, it, expect, vi } from "vitest";
import { createEngine } from "../src/index";

describe("createEngine()", () => {
  it("should start and stop the engine", () => {
    const engine = createEngine();

    expect(engine.isRunning()).toBe(false);

    engine.start();
    expect(engine.isRunning()).toBe(true);

    engine.stop();
    expect(engine.isRunning()).toBe(false);
  });

  it("should call update callback repeatedly when running", async () => {
    const engine = createEngine();
    const callback = vi.fn();

    engine.setFps({ fps: 1000 }); // fast ticks
    engine.onUpdate({ callback });
    engine.start();

    await new Promise((resolve) => setTimeout(resolve, 20));
    engine.stop();

    expect(callback).toHaveBeenCalled();
  });

  describe("branch coverage sanity", () => {
    it("should hit both delta branches", () => {
      const engine = createEngine();

      // Force one run where delta is small
      engine.setFps({ fps: 100000 }); // absurdly fast
      engine.onUpdate({ callback: () => {} });
      engine.start();
      engine.stop();

      // Force one run where delta is large
      engine.setFps({ fps: 1 });
      engine.onUpdate({ callback: () => {} });
      engine.start();
      engine.stop();
    });

    it("should hit both frameId branches", () => {
      const engine = createEngine();

      engine.stop(); // frameId is null
      engine.start();
      engine.stop(); // frameId is not null
    });
  });

  it("should not call update if frameDuration is too high", async () => {
    const engine = createEngine();
    const callback = vi.fn();

    engine.setFps({ fps: 1 }); // very slow
    engine.onUpdate({ callback });
    engine.start();

    await new Promise((resolve) => setTimeout(resolve, 10)); // too short to tick
    engine.stop();

    expect(callback).not.toHaveBeenCalled();
  });

  it("should not crash if stop() is called twice", () => {
    const engine = createEngine();

    engine.start();
    engine.stop();
    engine.stop(); // this will test the if (frameId !== null) path
  });
});
