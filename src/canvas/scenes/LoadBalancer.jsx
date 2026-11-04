/*
 * Load Balancer (About). A hub routes incoming dots round-robin to three
 * servers. The three servers are the three things my time is split between
 * right now (study, teaching, building), which is what the About panel says.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { boxEdges, cloneLine, mats, ringGeo, segmentsGeo } from '../kit'

const SERVERS = [
  [-3, 0.4, -3],
  [0, 0.4, -4],
  [3, 0.4, -3],
]
const DOTS = 9

export default function LoadBalancer({ position }) {
  const hubRing = useRef()
  const dots = useRef()
  const boxes = useRef([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const ring1 = useMemo(() => ringGeo(1.1, 64), [])
  const ring2 = useMemo(() => ringGeo(0.7, 6), [])
  const box = useMemo(() => boxEdges(1.2, 1.6, 1.2), [])
  const links = useMemo(() => segmentsGeo([[[0, 0, 6], [0, 0, 1.1]], ...SERVERS.map((s) => [[0, 0, 0], s])]), [])
  const lastHit = useRef([0, 0, 0])
  const boxMats = useMemo(() => SERVERS.map(() => cloneLine(mats.faded)), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    hubRing.current.rotation.y += dt * 0.4
    for (let i = 0; i < DOTS; i++) {
      // Each dot: 0..0.5 travels in to the hub, 0.5..1 travels out to its server.
      const k = (t * 0.35 + i / DOTS) % 1
      const server = SERVERS[i % 3]
      if (k < 0.5) dummy.position.set(0, 0, 6 - 12 * k)
      else dummy.position.set(server[0] * (k - 0.5) * 2, server[1] * (k - 0.5) * 2, server[2] * (k - 0.5) * 2)
      if (k > 0.97) lastHit.current[i % 3] = t
      dummy.scale.setScalar(0.07)
      dummy.updateMatrix()
      dots.current.setMatrixAt(i, dummy.matrix)
    }
    dots.current.instanceMatrix.needsUpdate = true
    boxMats.forEach((m, i) => {
      const glow = Math.exp(-(t - lastHit.current[i]) * 5)
      m.opacity = 0.5 + glow * 0.5
    })
  })

  return (
    <group position={position}>
      <group ref={hubRing}>
        <lineLoop geometry={ring1} material={mats.ink} />
        <lineLoop geometry={ring2} material={mats.accent} />
      </group>
      <lineSegments geometry={links} material={mats.faded} />
      {SERVERS.map((s, i) => (
        <lineSegments key={i} ref={(el) => (boxes.current[i] = el)} geometry={box} material={boxMats[i]} position={[s[0], s[1] + 0.4, s[2]]} />
      ))}
      <instancedMesh ref={dots} args={[undefined, undefined, DOTS]} material={mats.dotAccent}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </group>
  )
}
