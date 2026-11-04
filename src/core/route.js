/*
 * route.js — the journey, as data.
 *
 * Each stop has:
 *   cam   — where the camera sits when it arrives at this stop
 *   look  — what it looks at (also where that stop's 3D scene is placed)
 *   frame — 'center' puts the scene in the middle of the screen,
 *           'side' shifts it right so the HTML panel can sit on the left
 *   move  — how the camera travels during this section (see easeFor)
 *   vh    — section height in viewport heights (= how long you scroll here)
 *
 * Two Catmull-Rom splines are built through all the `cam` and `look` points.
 * Stop k sits exactly at spline parameter k / (N - 1), because
 * CatmullRomCurve3.getPoint(t) maps t linearly onto its control points.
 */
import { CatmullRomCurve3, Vector3 } from 'three'

export const STOPS = [
  { id: 'edge',       label: 'edge',          cam: [0, 0.3, 12],    look: [0, 0.2, 0],     frame: 'center', move: 'hero',   vh: 230 },
  { id: 'gate',       label: 'security gate', cam: [0, 0.2, -4],    look: [0, -0.2, -30],  frame: 'side',   move: 'linear', vh: 320 },
  { id: 'lb',         label: 'load balancer', cam: [5, 2.6, -38],   look: [10, 0, -48],    frame: 'side',   move: 'dwell',  vh: 210 },
  { id: 'carepilot',  label: 'carepilot',     cam: [-2, 3.4, -60],  look: [-9, 0, -70],    frame: 'side',   move: 'dwell',  vh: 260 },
  { id: 'rentflow',   label: 'rentflow',      cam: [3, 2.2, -84],   look: [10, 1.6, -93],  frame: 'side',   move: 'dwell',  vh: 260 },
  { id: 'sensorium',  label: 'sensorium',     cam: [-2, 2.6, -106], look: [-9, 1.2, -116], frame: 'side',   move: 'dwell',  vh: 260 },
  { id: 'bazaarlens', label: 'bazaarlens',    cam: [3, 3.6, -128],  look: [10, 0, -138],   frame: 'side',   move: 'dwell',  vh: 260 },
  { id: 'phd-erp',    label: 'phd erp',       cam: [-2, 2.8, -150], look: [-9, 0, -160],   frame: 'side',   move: 'dwell',  vh: 260 },
  { id: 'data',       label: 'data layer',    cam: [0, -3, -174],   look: [0, -9, -184],   frame: 'side',   move: 'dwell',  vh: 230 },
  { id: 'response',   label: 'response',      cam: [0, -7.5, -196], look: [0, -7.5, -210], frame: 'center', move: 'hold',   vh: 0 },
]

export const STOP_INDEX = Object.fromEntries(STOPS.map((s, i) => [s.id, i]))

const v = (a) => new Vector3(...a)
export const camCurve = new CatmullRomCurve3(STOPS.map((s) => v(s.cam)), false, 'centripetal')
export const lookCurve = new CatmullRomCurve3(STOPS.map((s) => v(s.look)), false, 'centripetal')

/** Spline parameter at which stop i sits. */
export const tOf = (i) => i / (STOPS.length - 1)

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/*
 * How far toward the NEXT stop the camera has gone, given progress in this
 * section. This is where the pacing lives:
 *   hero   — stay put while the name dissolves, then leave
 *   linear — move the whole time (the gate scene is a fly-through)
 *   dwell  — drift a little while you read, then travel in the last third
 */
export function easeFor(move, x) {
  switch (move) {
    case 'hero':   return smooth(0.55, 1, x)
    case 'linear': return x
    case 'dwell':  return 0.12 * x + 0.88 * smooth(0.62, 1, x)
    default:       return 0
  }
}

/** Turn per-section progress into one parameter along the spline. */
export function cameraT(local) {
  for (let i = STOPS.length - 1; i >= 0; i--) {
    const p = local[STOPS[i].id] ?? 0
    if (p > 0 || i === 0) {
      const next = Math.min(i + 1, STOPS.length - 1)
      return tOf(i) + (tOf(next) - tOf(i)) * easeFor(STOPS[i].move, p)
    }
  }
  return 0
}

export { clamp01, smooth }
