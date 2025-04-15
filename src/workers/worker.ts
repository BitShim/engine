import type { MainToWorkerMessage, WorkerToMainMessage } from './messages';

let hz = 60;
let interval = 1000 / hz;
const MAX_HZ = 500;

let timerId: ReturnType<typeof setInterval> | null = null;

function startTicking() {
  if (timerId !== null) return;

  timerId = setInterval(() => {
    const message: WorkerToMainMessage = {
      type: 'tick',
      timestamp: performance.now(),
    };
    self.postMessage(message);
  }, interval);
}

function restartTicking() {
  if (timerId !== null) clearInterval(timerId);
  interval = 1000 / hz;
  timerId = setInterval(() => {
    const message: WorkerToMainMessage = {
      type: 'tick',
      timestamp: performance.now(),
    };
    self.postMessage(message);
  }, interval);
}

self.onmessage = (event: MessageEvent<MainToWorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === 'setHz') {
    const newHz = Math.min(Math.max(1, payload?.hz ?? 60), MAX_HZ);
    hz = newHz;
    restartTicking();
  }
};

startTicking();
