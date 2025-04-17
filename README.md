# @bitshim/engine

[![npm version](https://img.shields.io/npm/v/@bitshim/engine.svg)](https://www.npmjs.com/package/@bitshim/engine)
[![codecov](https://codecov.io/gh/BitShim/engine/branch/main/graph/badge.svg)](https://codecov.io/gh/BitShim/engine)

A lightweight, high-performance core for browser-based game engines, providing Web Worker–based ticking and flexible loop management.

---

## Why use this?

- 🚀 **High-performance**: Web Worker–driven simulation tick loop
- 🧠 **Smart focus handling**: Automatically throttles or pauses when hidden/unfocused
- ⟳ **Multiple loops**: Easily manage physics, simulation, rendering, etc.
- 📊 **Built-in metrics**: Track FPS, frame time, dropped frames

---

## Table of Contents

- [@bitshim/engine](#bitshimengine)
  - [Why use this?](#why-use-this)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Other Loops](#other-loops)
  - [API Reference](#api-reference)
    - [`createEngine(options)`](#createengineoptions)
  - [License](#license)

---

## Installation

```bash
# npm
npm install @bitshim/engine

# yarn
yarn add @bitshim/engine

# bun
bun add @bitshim/engine
```

---

## Quick Start

```ts
import { createEngine } from '@bitshim/engine';

function handleSimulationTick() {
  console.log('Running simulation step');
}

function handleRenderTick() {
  console.log('Rendering scene frame');
}

const engine = createEngine({
  loops: [
    {
      name: 'simulation',
      interval: 1000 / 60,
      callback: handleSimulationTick,
    },
    {
      name: 'rendering',
      interval: 1000 / 60,
      callback: handleRenderTick,
      reduceWhenUnfocused: true,
      pauseWhenHidden: true,
      unfocusedInterval: 1000 / 30,
    },
  ],
});
```

---

## Other Loops

You can add more loops for background tasks, physics, or analytics:

```ts
function handlePhysicsTick() {
  console.log('Executing physics update');
}

engine.loopManager.registerLoop({
  name: 'physics',
  interval: 1000 / 20, // 20 FPS physics
  callback: handlePhysicsTick,
});
```

---

## API Reference

### `createEngine(options)`

Creates and initializes the core game engine.

| Parameter    | Type            | Description                                                      |
|--------------|-----------------|------------------------------------------------------------------|
| `loops`      | `LoopConfig[]`  | Array of loop configurations (required; must not be empty)       |
| `hz`         | `number`        | Web Worker tick rate in Hz (default: `60`)                       |
| `autoStart`  | `boolean`       | Whether to start automatically on creation (default: `true`)     |

**Returns** an object with:

- `start()` – Starts the Worker with the specified tick rate
- `stop()` – Terminates the Worker
- `worker` – Underlying `Worker` instance
- `loopManager` – Manager for controlling individual loops

---

## License

MIT © [Bit Shim](https://github.com/BitShim) — commercial use allowed

