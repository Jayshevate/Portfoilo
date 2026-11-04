/*
 * RentFlow. A five-storey building, three units per floor. Each unit's
 * front face is an instance of one plane whose colour shows its rent state.
 * States re-roll as you scroll (one "month" per slice of the section)
 * plus the occasional change on their own, so the building feels lived in.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C, mats, mergeBoxes, rng, segmentsGeo } from '../kit'
import { scroll } from '../../core/store'

const COLS = 3
const FLOORS = 5
const U = { w: 1.1, h: 0.8, d: 1.1 }
const STATES = [
  { color: C.ink, opacity: 0.32 },     // settled
  { color: C.faded, opacity: 0.3 },    // pending
  { color: C.accent, opacity: 0.75 },  // overdue
  { color: C.paper, opacity: 0.0 },    // vacant
]

export default function RentFlow({ position }) {
  const units = useMemo(() => {
    const list = []
    for (let f = 0; f < FLOORS; f++)
      for (let c = 0; c < COLS; c++) list.push([(c - 1) * U.w, f * U.h + U.h / 2 - 1.6, 0])
    return list
  }, [])
  const frame = useMemo(() => mergeBoxes(units.map((p) => ({ size: [U.w, U.h, U.d], pos: p }))), [units])
  const roof = useMemo(
    () => segmentsGeo([
      [[-1.9, FLOORS * U.h - 1.6, 0.55], [0, FLOORS * U.h - 0.9, 0.55]],
      [[0, FLOORS * U.h - 0.9, 0.55], [1.9, FLOORS * U.h - 1.6, 0.55]],
      [[-3, -1.6, 1.4], [3, -1.6, 1.4]],
    ]),
    [],
  )
  const fills = useRef()
  const r = useMemo(() => rng(3), [])
  const state = useRef(units.map(() => Math.floor(r() * 3)))
  const month = useRef(-1)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide }), [])
  const col = useMemo(() => new THREE.Color(), [])
  const nextFlip = useRef(0)

  useFrame((s) => {
    const t = s.clock.elapsedTime
    const m = Math.floor((scroll.local.rentflow ?? 0) * 8)
    let dirty = false
    if (m !== month.current) {
      month.current = m
      state.current = state.current.map(() => {
        const x = r()
        return x < 0.55 ? 0 : x < 0.8 ? 1 : x < 0.92 ? 2 : 3
      })
      dirty = true
    }
    if (t > nextFlip.current) {
      const i = Math.floor(r() * units.length)
      state.current[i] = (state.current[i] + 1) % 3
      nextFlip.current = t + 0.6 + r() * 1.2
      dirty = true
    }
    if (!dirty && fills.current.userData.init) return
    fills.current.userData.init = true
    units.forEach((p, i) => {
      const st = STATES[state.current[i]]
      dummy.position.set(p[0], p[1], U.d / 2 + 0.001)
      dummy.scale.set(U.w * 0.86, U.h * 0.78, 1)
      dummy.updateMatrix()
      fills.current.setMatrixAt(i, dummy.matrix)
      // Opacity is faked by mixing toward the paper colour.
      col.copy(C.paper).lerp(st.color, st.opacity)
      fills.current.setColorAt(i, col)
    })
    fills.current.instanceMatrix.needsUpdate = true
    if (fills.current.instanceColor) fills.current.instanceColor.needsUpdate = true
  })

  return (
    <group position={position} rotation-y={-0.5}>
      <lineSegments geometry={frame} material={mats.ink} />
      <lineSegments geometry={roof} material={mats.faded} />
      <instancedMesh ref={fills} args={[undefined, undefined, units.length]} material={mat}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </group>
  )
}
