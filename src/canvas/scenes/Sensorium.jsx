/*
 * Sensorium Nexus. Devices on the floor send readings up into a wall of
 * panels. Each panel holds a live line chart: its vertex buffer is shifted
 * left by one sample and a new reading is pushed every few frames.
 * Readings are a mix of slow sine + noise, i.e. obviously simulated.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mats, rng, segmentsGeo } from '../kit'

const PANELS = 6
const SAMPLES = 64
const PW = 2.2
const PH = 1.0

export default function Sensorium({ position }) {
  const r = useMemo(() => rng(9), [])
  const layout = useMemo(
    () =>
      Array.from({ length: PANELS }, (_, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const a = (col - 1) * 0.45
        return {
          pos: [Math.sin(a) * 5.2, 0.9 + row * 1.4, -Math.cos(a) * 5.2 + 4],
          rotY: -a,
          freq: 0.4 + r() * 1.4,
          phase: r() * 10,
          device: [(col - 1) * 1.6 + (row - 0.5) * 0.7, -1.5, 1.8 + row * 0.6],
        }
      }),
    [r],
  )
  const frame = useMemo(() => {
    const w = PW / 2
    const h = PH / 2
    return segmentsGeo([
      [[-w, -h, 0], [w, -h, 0]], [[w, -h, 0], [w, h, 0]], [[w, h, 0], [-w, h, 0]], [[-w, h, 0], [-w, -h, 0]],
      [[-w, 0, 0], [-w + 0.08, 0, 0]], [[-w, h * 0.5, 0], [-w + 0.05, h * 0.5, 0]], [[-w, -h * 0.5, 0], [-w + 0.05, -h * 0.5, 0]],
    ])
  }, [])
  const charts = useMemo(
    () =>
      layout.map(() => {
        const g = new THREE.BufferGeometry()
        const arr = new Float32Array(SAMPLES * 3)
        for (let i = 0; i < SAMPLES; i++) arr[i * 3] = -PW / 2 + 0.06 + (i / (SAMPLES - 1)) * (PW - 0.12)
        g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
        return g
      }),
    [layout],
  )
  const wires = useMemo(() => segmentsGeo(layout.map((l) => [l.device, [l.pos[0], l.pos[1] - PH / 2, l.pos[2]]])), [layout])
  const dots = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tick = useRef(0)

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    tick.current += dt
    if (tick.current > 1 / 30) {
      tick.current = 0
      charts.forEach((g, p) => {
        const a = g.attributes.position.array
        for (let i = 0; i < SAMPLES - 1; i++) a[i * 3 + 1] = a[(i + 1) * 3 + 1]
        const L = layout[p]
        const v = Math.sin(t * L.freq + L.phase) * 0.22 + Math.sin(t * L.freq * 3.7) * 0.08 + (r() - 0.5) * 0.12
        a[(SAMPLES - 1) * 3 + 1] = Math.max(-PH / 2 + 0.05, Math.min(PH / 2 - 0.05, v))
        g.attributes.position.needsUpdate = true
      })
    }
    // Readings travel up the wires.
    layout.forEach((l, i) => {
      for (let k = 0; k < 2; k++) {
        const q = (t * 0.6 + i * 0.17 + k * 0.5) % 1
        dummy.position.set(
          l.device[0] + (l.pos[0] - l.device[0]) * q,
          l.device[1] + (l.pos[1] - PH / 2 - l.device[1]) * q,
          l.device[2] + (l.pos[2] - l.device[2]) * q,
        )
        dummy.scale.setScalar(0.05)
        dummy.updateMatrix()
        dots.current.setMatrixAt(i * 2 + k, dummy.matrix)
      }
    })
    dots.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={position} rotation-y={0.35}>
      {layout.map((l, i) => (
        <group key={i} position={l.pos} rotation-y={l.rotY}>
          <lineSegments geometry={frame} material={mats.faded} />
          <line geometry={charts[i]} material={i === 1 ? mats.accent : mats.ink} frustumCulled={false} />
        </group>
      ))}
      <lineSegments geometry={wires} material={mats.faded} />
      {layout.map((l, i) => (
        <mesh key={i} position={l.device} material={mats.dotInk}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
        </mesh>
      ))}
      <instancedMesh ref={dots} args={[undefined, undefined, PANELS * 2]} material={mats.dotAccent}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </group>
  )
}
