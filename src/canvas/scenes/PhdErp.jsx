/*
 * DYPIU PhD ERP. A row of stations along a gentle arc. A student token moves
 * through them as you scroll; each station it passes gets "stamped" (a tick
 * appears and its frame turns from faded to ink). Stations are unnamed on
 * purpose: the real workflow stages belong in the case study, not in a guess.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C, cloneLine, mats, segmentsGeo } from '../kit'
import { scroll } from '../../core/store'
import { smooth } from '../../core/route'

const N = 6

export default function PhdErp({ position }) {
  const stations = useMemo(
    () => Array.from({ length: N }, (_, i) => {
      const a = (i / (N - 1) - 0.5) * 1.6
      return new THREE.Vector3(Math.sin(a) * 6, 0, -Math.cos(a) * 6 + 5)
    }),
    [],
  )
  const frame = useMemo(
    () => segmentsGeo([
      [[-0.55, -1.5, 0], [-0.55, 0.5, 0]], [[0.55, -1.5, 0], [0.55, 0.5, 0]], [[-0.55, 0.5, 0], [0.55, 0.5, 0]],
      [[-0.75, -1.5, 0], [0.75, -1.5, 0]],
    ]),
    [],
  )
  const tick = useMemo(() => segmentsGeo([[[-0.2, 0.85, 0], [-0.05, 0.7, 0]], [[-0.05, 0.7, 0], [0.25, 1.05, 0]]]), [])
  const path = useMemo(() => new THREE.CatmullRomCurve3(stations), [stations])
  const pathGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(path.getPoints(80).map((p) => p.setY(-1.5))), [path])
  const frameMats = useMemo(() => stations.map(() => cloneLine(mats.faded)), [stations])
  const ticks = useRef([])
  const token = useRef()
  const shown = useRef(0)

  useFrame((s, dt) => {
    const target = smooth(0.05, 0.62, scroll.local['phd-erp'] ?? 0)
    shown.current += (target - shown.current) * (1 - Math.exp(-dt * 5))
    const k = shown.current
    path.getPoint(k, token.current.position)
    token.current.position.y = -1.2 + Math.abs(Math.sin(k * Math.PI * (N - 1))) * 0.25
    token.current.rotation.y += dt
    stations.forEach((_, i) => {
      const done = k >= i / (N - 1) - 0.001
      frameMats[i].color.copy(done ? C.ink : C.faded)
      ticks.current[i].visible = done && k > 0.001
    })
  })

  return (
    <group position={position} rotation-y={0.3}>
      <line geometry={pathGeo} material={mats.faded} />
      {stations.map((p, i) => {
        const yaw = Math.atan2(-p.x, 5 - p.z)
        return (
          <group key={i} position={p} rotation-y={yaw}>
            <lineSegments geometry={frame} material={frameMats[i]} />
            <lineSegments ref={(el) => (ticks.current[i] = el)} geometry={tick} material={mats.accent} visible={false} />
          </group>
        )
      })}
      <mesh ref={token} material={mats.dotAccent}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
      </mesh>
    </group>
  )
}
