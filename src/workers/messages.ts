/**
 * Message types exchanged between the main thread and the worker.
 */

/** Outgoing messages (from worker to main) */
export type WorkerToMainMessage = {
  type: 'tick';
  timestamp: number;
};

/** Incoming messages (from main to worker) */
export type MainToWorkerMessage = {
  type: 'setHz';
  payload: {
    hz: number;
  };
};
