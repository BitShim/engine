# @bitshim/engine

[![npm version](https://img.shields.io/npm/v/@bitshim/engine.svg)](https://www.npmjs.com/package/@bitshim/engine)

A lightweight, high-performance core for browser-based game engines, providing Web Worker–based ticking and flexible loop management.

## Table of Contents

- [@bitshim/engine](#bitshimengine)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Other Loops](#other-loops)
  - [API Reference](#api-reference)
    - [`createEngine(options)`](#createengineoptions)
  - [License](#license)

## Installation

Install via your preferred package manager:

```bash
# npm
npm install @bitshim/engine

# yarn
yarn add @bitshim/engine

# bun
bun add @bitshim/engine
```

## Quick Start

```ts
import { createEngine } from '@bitshim/engine';

// Define loop callbacks
function handleSimulationTick() {
  console.log('Running simulation step');
}

function handleRenderTick() {
  console.log('Rendering scene frame');
}

// Initialize engine with simulation and rendering loops
const engine = createEngine({
  loops: [
    {
      name: 'simulation',
      interval: 1000 / 60, // ~60 fps
      callback: handleSimulationTick,
    },
    {
      name: 'rendering',
      interval: 1000 / 60, // ~60 fps
      callback: handleRenderTick,
      reduceWhenUnfocused: true,
      pauseWhenHidden: true,
      unfocusedInterval: 1000 / 30, // ~30 fps when unfocused
    },
  ],
});
```

## Other Loops

You can add a physics loop by:

1. Creating a physics callback function:

```ts
function handlePhysicsTick() {
  console.log('Executing physics update');
}
```

2. Adding an extra item to the `loops` array:

```ts
{
  name: 'physics',
  interval: 1000 / 20, // 20 FPS physics
  callback: handlePhysicsTick,
},
```

This allows you to run lower-frequency updates for things like physics simulations or background processing.

## API Reference

### `createEngine(options)`

Creates and initializes the core game engine.

| Parameter    | Type            | Description                                                      |
|--------------|-----------------|------------------------------------------------------------------|
| `loops`      | `LoopConfig[]`  | Array of loop configurations (required; must not be empty)       |
| `hz`         | `number`        | Web Worker tick rate in Hz (default: `60`)                       |
| `autoStart`  | `boolean`       | Whether to start automatically on creation (default: `true`)     |

**Returns** an object with:

- `start()` – Send tick-rate update to the Worker or start it
- `stop()` – Terminate the Worker
- `worker` – Underlying `Worker` instance
- `loopManager` – Manager for controlling individual loops

## License

MIT © Bit Shim
