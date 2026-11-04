/*
 * Security Gate. Two physical gates sit on the camera path, one per
 * certification. Each holds a hatched "membrane" (dissolve shader) that burns
 * away once the packet has been scanned and that cert is checked.
 * The scan itself is drawn by the packet's own shader (see Packet.jsx).
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vert from '../shaders/dissolve.vert'
import frag from '../shaders/dissolve.frag'
import { C, cloneLine, mats, segmentsGeo } from '../kit'
import { camCurve, smooth, tOf, STOP_INDEX } from '../../core/route'
import { scroll } from '../../core/store'

const W = 3.4
const H = 2.6

// Where along the gate→lb stretch each gate stands, and when it opens.
const GATES = [
  { along: 0.3, open: [0.15, 0.22] },
  { along: 0.62, open: [0.45, 0.52] },
]

function frameGeo() {
  const w = W / 2
  const h = H / 2
  const t = 0.25 // corner tick length
  return segmentsGeo([
    [[-w, -h, 0], [w, -h, 0]], [[w, -h, 0], [w, h, 0]], [[w, h, 0], [-w, h, 0]], [[-w, h, 0], [-w, -h, 0]],
    // outer registration ticks, like crop marks on a drawing
    [[-w - t, h + 0.12, 0], [-w - 0.05, h + 0.12, 0]], [[w + 0.05, h + 0.12, 0], [w + t, h + 0.12, 0]],
    [[-w - t, -h - 0.12, 0], [-w - 0.05, -h - 0.12, 0]], [[w + 0.05, -h - 0.12, 0], [w + t, -h - 0.12, 0]],
    // pylons down to the floor
    [[-w, -h, 0], [-w, -h - 0.4, 0]], [[w, -h, 0], [w, -h - 0.4, 0]],
  ])
}

function OneGate({ along, open }) {
  const i = STOP_INDEX.gate
  const t = tOf(i) + (tOf(i + 1) - tOf(i)) * along
  const pos = camCurve.getPoint(t)
  const tan = camCurve.getTangent(t)
  const yaw = Math.atan2(tan.x, tan.z)
  pos.y -= 0.75

  const frame = useMemo(frameGeo, [])
  const frameMat = useMemo(() => cloneLine(mats.faded), [])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uDissolve: { value: 0 },
          uAccent: { value: C.accent },
          uInk: { value: C.ink },
          uAspect: { value: new THREE.Vector2(W, H) },
        },
      }),
    [],
  )
  const membrane = useRef()

  useFrame((state) => {
    const d = smooth(open[0], open[1], scroll.local.gate ?? 0)
    mat.uniforms.uDissolve.value = d
    mat.uniforms.uTime.value = state.clock.elapsedTime
    membrane.current.visible = d < 0.999
    frameMat.color.copy(C.faded).lerp(C.ink, d)
    frameMat.opacity = 0.75 + 0.25 * d
  })

  return (
    <group position={pos} rotation-y={yaw}>
      <lineSegments geometry={frame} material={frameMat} />
      <mesh ref={membrane} material={mat}>
        <planeGeometry args={[W, H]} />
      </mesh>
    </group>
  )
}

export default function Gate() {
  const ref = useRef()
  // Hidden while the hero name is on screen, so the gates don't show through the letters.
  useFrame(() => (ref.current.visible = (scroll.local.edge ?? 0) > 0.45 || (scroll.local.gate ?? 0) > 0))
  return (
    <group ref={ref}>
      {GATES.map((g, k) => (
        <OneGate key={k} {...g} />
      ))}
    </group>
  )
}
