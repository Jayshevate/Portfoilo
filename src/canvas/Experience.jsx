/*
 * Experience — the whole 3D world in one <Canvas>.
 *
 * This file is itself lazy-loaded by App.jsx, so the HTML content paints
 * before three.js has even downloaded.
 *
 * Scenes mount only when they're near: the active stop, one behind and two
 * ahead. Each scene is its own code-split chunk; the one after next is
 * prefetched so it's ready before the camera gets there.
 */
import { Suspense, lazy, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import Ground from './Ground'
import Packet from './Packet'
import Edge from './scenes/Edge'
import { STOPS, STOP_INDEX } from '../core/route'
import { useStore } from '../core/store'
import { quality } from '../core/quality'
import { PALETTE, boil, boilAmp } from './kit'

const loaders = {
  gate: () => import('./scenes/Gate'),
  lb: () => import('./scenes/LoadBalancer'),
  carepilot: () => import('./scenes/CarePilot'),
  rentflow: () => import('./scenes/RentFlow'),
  sensorium: () => import('./scenes/Sensorium'),
  bazaarlens: () => import('./scenes/BazaarLens'),
  'phd-erp': () => import('./scenes/PhdErp'),
  data: () => import('./scenes/DataLayer'),
  response: () => import('./scenes/Response'),
}
const Lazy = Object.fromEntries(Object.entries(loaders).map(([k, f]) => [k, lazy(f)]))

/* Steps the line-boil clock at 8 drawings per second (see kit.js). */
function Boil() {
  useFrame((state) => {
    boil.value = Math.floor(state.clock.elapsedTime * 8) % 64
  })
  return null
}
if (quality.reducedMotion) boilAmp.value = 0

function World() {
  const active = STOP_INDEX[useStore((s) => s.activeStop)] ?? 0

  useEffect(() => {
    STOPS.slice(active + 1, active + 4).forEach((s) => loaders[s.id]?.())
  }, [active])

  return (
    <>
      <color attach="background" args={[PALETTE.paper]} />
      <fog attach="fog" args={[PALETTE.paper, 14, 46]} />
      <CameraRig />
      <Boil />
      <Ground />
      {active <= 1 && <Edge position={STOPS[0].look} />}
      {STOPS.map((s, i) => {
        const C = Lazy[s.id]
        if (!C || i < active - 1 || i > active + 2) return null
        return (
          <Suspense key={s.id} fallback={null}>
            <C position={s.look} />
          </Suspense>
        )
      })}
      <Packet />
    </>
  )
}

export default function Experience() {
  const [dpr, setDpr] = useState(quality.dpr)
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ fov: 40, near: 0.1, far: 80, position: STOPS[0].cam }}
        gl={{ antialias: quality.tier !== 'low', powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        {/* If fps drops, step resolution down; if it recovers, step back up. */}
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(quality.dpr, d + 0.25))}
        />
        <World />
      </Canvas>
    </div>
  )
}
