export type LoopConfig = {
  /** Unique identifier for the loop. */
  name: string;
  /** Time interval in milliseconds between each callback execution. */
  interval: number;
  /** Function to be called at each interval. */
  callback: () => void;
  /** Whether to reduce the interval when window loses focus. */
  reduceWhenUnfocused?: boolean;
  /** Whether to pause the loop when the tab is hidden. */
  pauseWhenHidden?: boolean;
  /** Alternate interval to use when unfocused (if reduced). */
  unfocusedInterval?: number;
};
