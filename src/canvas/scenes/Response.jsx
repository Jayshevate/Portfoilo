/*
 * Response. The packet arrives back and bursts into "200 OK", the same
 * particle system as the hero running backwards. Two expanding rings mark
 * the return trip.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import ParticleText from '../ParticleText'
import { scroll } from '../../core/store'
import { smooth } from '../../core/route'
import { cloneLine, mats, ringGeo } from '../kit'

export default function Response({ position }) {
  const rings = useRef([])
  const geo = useMemo(() => ringGeo(1, 64), [])
  const ringMats = useMemo(() => [cloneLine(mats.faded), cloneLine(mats.faded)], [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    rings.current.forEach((r, i) => {
      if (!r) return
      const k = ((t * 0.25 + i * 0.5) % 1)
      r.scale.setScalar(1 + k * 7)
      r.material.opacity = (1 - k) * 0.5
    })
  })

  return (
    <group>
      <ParticleText
        lines={['200 OK']}
        center={[position[0], position[1] + 0.6, position[2]]}
        seed={23}
        getIntro={() => 1}
        getMorph={() => 1 - smooth(0.02, 0.26, scroll.local.response ?? 0)}
      />
      <group position={position} rotation-x={Math.PI / 2}>
        {[0, 1].map((i) => (
          <lineLoop key={i} ref={(el) => (rings.current[i] = el)} geometry={geo} material={ringMats[i]} />
        ))}
      </group>
    </group>
  )
}
