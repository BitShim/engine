/**
 * Das engine yas
 */
export function createEngine() {
  let running = false;
  let fps = 60;
  let frameDuration = 1000 / fps;
  let lastTime = 0;
  let updateCallback: (({ delta }: { delta: number }) => void) | null = null;

  let frameId: number | null = null;

  function loop() {
    if (!running) return;

    const now = performance.now();
    const delta = now - lastTime;

    if (delta >= frameDuration) {
      lastTime = now;
      if (updateCallback) updateCallback({ delta });
    }

    frameId = requestAnimationFrame(loop);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      loop();
    },

    stop() {
      running = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    },

    setFps({ fps }: { fps?: number }) {
      fps ??= 60;
      frameDuration = 1000 / fps;
    },

    onUpdate({
      callback,
    }: {
      callback: ({ delta }: { delta: number }) => void;
    }) {
      updateCallback = callback;
    },

    isRunning() {
      return running;
    },
  };
}
