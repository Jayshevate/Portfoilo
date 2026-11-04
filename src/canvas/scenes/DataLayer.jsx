/*
 * Data layer (skills). Below the drafting-table floor: a column of storage
 * shards (rings with spokes) turning at different speeds, threaded by index
 * lines. The packet dives through the floor to get here.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mats, ringGeo, segmentsGeo } from '../kit'

const LAYERS = 5

export default function DataLayer({ position }) {
  const ring = useMemo(() => ringGeo(2.4, 72), [])
  const inner = useMemo(() => ringGeo(1.3, 48), [])
  const spokes = useMemo(() => {
    const pairs = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      pairs.push([[Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3], [Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4]])
    }
    return segmentsGeo(pairs)
  }, [])
  const index = useMemo(
    () => segmentsGeo([0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + 0.4
      return [[Math.cos(a) * 1.85, 3.2, Math.sin(a) * 1.85], [Math.cos(a) * 1.85, -3.2, Math.sin(a) * 1.85]]
    })),
    [],
  )
  const layers = useRef([])

  useFrame((_, dt) => {
    layers.current.forEach((l, i) => l && (l.rotation.y += dt * (i % 2 ? -0.12 : 0.18) * (1 + i * 0.15)))
  })

  return (
    <group position={position}>
      <lineSegments geometry={index} material={mats.faded} />
      {Array.from({ length: LAYERS }, (_, i) => (
        <group key={i} ref={(el) => (layers.current[i] = el)} position-y={(i - (LAYERS - 1) / 2) * 1.4}>
          <lineLoop geometry={ring} material={i === 2 ? mats.accent : mats.ink} />
          <lineLoop geometry={inner} material={mats.faded} />
          <lineSegments geometry={spokes} material={mats.faded} />
        </group>
      ))}
    </group>
  )
}
