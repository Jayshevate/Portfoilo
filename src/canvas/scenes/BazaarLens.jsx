/*
 * BazaarLens. Four store lanes. A product box races down each lane; its
 * arrival time is how fast that store answered. Above each box a bar shows
 * its price. Once every lane has answered, the CHEAPEST lane lights up,
 * not the fastest one. Then a new race starts. All values are random.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C, boxEdges, cloneLine, mats, rng, segmentsGeo } from '../kit'

const LANES = 4
const LEN = 7.5

export default function BazaarLens({ position }) {
  const r = useMemo(() => rng(5), [])
  const track = useMemo(() => {
    const pairs = []
    for (let i = 0; i <= LANES; i++) pairs.push([[-LEN / 2, -1.2, i * 1.1 - 2.2], [LEN / 2, -1.2, i * 1.1 - 2.2]])
    pairs.push([[LEN / 2, -1.2, -2.4], [LEN / 2, -1.2, 2.4]]) // finish line
    pairs.push([[-LEN / 2, -1.2, -2.4], [-LEN / 2, -1.2, 2.4]]) // start line
    return segmentsGeo(pairs)
  }, [])
  const box = useMemo(() => boxEdges(0.45, 0.45, 0.45), [])
  const bar = useMemo(() => boxEdges(0.12, 1, 0.12), [])
  const race = useRef(null)
  const boxes = useRef([])
  const bars = useRef([])
  const laneMats = useMemo(() => Array.from({ length: LANES }, () => cloneLine(mats.ink)), [])

  const newRace = (t) => ({
    start: t,
    dur: Array.from({ length: LANES }, () => 1.2 + r() * 2.2),
    price: Array.from({ length: LANES }, () => 0.3 + r() * 1.2),
  })

  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (!race.current) race.current = newRace(t)
    const R = race.current
    const e = t - R.start
    const allIn = Math.max(...R.dur)
    const cheapest = R.price.indexOf(Math.min(...R.price))
    for (let i = 0; i < LANES; i++) {
      const k = Math.min(1, e / R.dur[i])
      const eased = 1 - Math.pow(1 - k, 2)
      const x = -LEN / 2 + 0.3 + eased * (LEN - 0.6)
      const z = i * 1.1 - 1.65
      boxes.current[i].position.set(x, -0.95, z)
      boxes.current[i].rotation.x = k < 1 ? e * 6 : 0
      bars.current[i].position.set(x, -0.6 + R.price[i] / 2, z)
      bars.current[i].scale.y = R.price[i]
      const won = e > allIn + 0.2 && i === cheapest
      laneMats[i].color.copy(won ? C.accent : k < 1 ? C.faded : C.ink)
    }
    if (e > allIn + 2.6) race.current = newRace(t)
  })

  return (
    <group position={[position[0] - 1.4, position[1], position[2] + 1]} rotation-y={0.22}>
      <lineSegments geometry={track} material={mats.faded} />
      {Array.from({ length: LANES }, (_, i) => (
        <group key={i}>
          <lineSegments ref={(el) => (boxes.current[i] = el)} geometry={box} material={laneMats[i]} />
          <lineSegments ref={(el) => (bars.current[i] = el)} geometry={bar} material={laneMats[i]} />
        </group>
      ))}
    </group>
  )
}
