/*
 * Two kinds of state live here, on purpose:
 *
 * 1. `useStore` (zustand) — things React should re-render for: which stop is
 *    active, is the terminal open, is sound on. These change rarely.
 *
 * 2. `scroll` — a plain mutable object written on every scroll event and read
 *    inside useFrame() 60 times a second. Putting that in React state would
 *    re-render the whole tree every frame, so it deliberately isn't reactive.
 */
import { create } from 'zustand'

export const useStore = create((set) => ({
  // 'experience' | 'simple'. The inline script in index.html decides first.
  mode: typeof document !== 'undefined' && document.documentElement.classList.contains('is-simple') ? 'simple' : 'experience',
  setMode: (mode) => set({ mode }),

  canvasReady: false,
  setCanvasReady: (canvasReady) => set({ canvasReady }),

  activeStop: 'edge',
  setActiveStop: (activeStop) => set({ activeStop }),

  // How many certification gates the packet has cleared (0, 1, 2).
  gateStage: 0,
  setGateStage: (gateStage) => set({ gateStage }),

  sound: false,
  setSound: (sound) => set({ sound }),

  terminal: false,
  setTerminal: (terminal) => set({ terminal }),
}))

/** Hot path state. Written by core/scroll.js, read by the 3D scenes. */
export const scroll = {
  /** 0..1 progress inside each stop's <section>, keyed by stop id. */
  local: {},
  /** Parameter along the camera spline, 0..1 (before smoothing). */
  camT: 0,
  /** Lenis velocity, used for subtle motion blur-ish stretching. */
  velocity: 0,
}

/** Shared between Packet and particle scenes: where the packet is in world space. */
export const packetState = {
  position: [0, 0, 0],
  opacity: 0,
}
