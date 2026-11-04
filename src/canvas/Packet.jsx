/*
 * Packet — the request. It's the only thing that exists in every scene.
 *
 * It rides a fixed spot in front of the camera (like a cursor for the
 * journey), but in *world* space, so it physically passes through gates and
 * leaves a trail behind it. It publishes its world position to `packetState`
 * so the particle systems can collapse into it / burst out of it.
 */
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import vert from './shaders/packet.vert'
import frag from './shaders/packet.frag'
import { C, mats, ringGeo } from './kit'
import { packetState, scroll } from '../core/store'
import { smooth } from '../core/route'

const OFFSET = new THREE.Vector3(0, -0.85, -3.4)
const TRAIL = 48
const RADIUS = 0.1

export default function Packet() {
  const camera = useThree((s) => s.camera)
  const group = useRef()
  const spin = useRef()
  const shell = useRef()
  const ring = useRef()
  const world = useMemo(() => new THREE.Vector3(), [])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uScan: { value: 3 },
          uVerified: { value: 0 },
          uOpacity: { value: 0 },
          uAccent: { value: C.accent },
          uInk: { value: C.ink },
          uPaper: { value: C.paper },
        },
      }),
    [],
  )

  // Trail: a ring buffer of past positions drawn as a fading line.
  const trail = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3))
    const m = new THREE.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0.6 })
    const line = new THREE.Line(g, m)
    line.frustumCulled = false
    return line
  }, [])
  const filled = useRef(false)
  const ringGeom = useMemo(() => ringGeo(RADIUS * 2.1, 40), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const L = scroll.local

    // World position = a point in front of the camera.
    world.copy(OFFSET).applyMatrix4(camera.matrixWorld)
    group.current.position.copy(world)
    spin.current.rotation.y += dt * 0.6
    spin.current.rotation.x = Math.sin(t * 0.7) * 0.3
    packetState.position[0] = world.x
    packetState.position[1] = world.y
    packetState.position[2] = world.z

    // Visible after the hero name has collapsed, until the response bursts it.
    const born = smooth(0.4, 0.5, L.edge ?? 0)
    const gone = smooth(0.04, 0.12, L.response ?? 0)
    const opacity = born * (1 - gone)
    packetState.opacity = opacity
    mat.uniforms.uOpacity.value = opacity
    shell.current.material.opacity = opacity * 0.9
    group.current.visible = opacity > 0.01

    // Security scan: two sweeps, one per gate, timed to the gate section.
    const g = L.gate ?? 0
    const sweep = (a, b) => (g > a && g < b ? 1.2 - 2.4 * ((g - a) / (b - a)) : null)
    const s = sweep(0.02, 0.15) ?? sweep(0.3, 0.43)
    mat.uniforms.uScan.value = s ?? 3
    ring.current.visible = s !== null
    if (s !== null) ring.current.position.y = s * RADIUS
    const flash = Math.max(smooth(0.15, 0.17, g) - smooth(0.2, 0.26, g), smooth(0.45, 0.47, g) - smooth(0.5, 0.56, g))
    mat.uniforms.uVerified.value = flash
    mat.uniforms.uTime.value = t

    // Shift the trail: oldest point drops off, newest is the packet.
    const arr = trail.geometry.attributes.position.array
    if (!filled.current) {
      for (let i = 0; i < TRAIL; i++) arr.set([world.x, world.y, world.z], i * 3)
      filled.current = true
    }
    arr.copyWithin(3, 0, (TRAIL - 1) * 3)
    arr[0] = world.x
    arr[1] = world.y
    arr[2] = world.z
    trail.geometry.attributes.position.needsUpdate = true
    trail.material.opacity = 0.55 * opacity
  })

  return (
    <>
      <group ref={group}>
        <group ref={spin}>
          <mesh material={mat}>
            <icosahedronGeometry args={[RADIUS, 2]} />
          </mesh>
          <lineSegments ref={shell}>
            <edgesGeometry args={[new THREE.IcosahedronGeometry(RADIUS * 1.35, 0)]} />
            <lineBasicMaterial color={C.accent} transparent />
          </lineSegments>
        </group>
        {/* Outside the spinning group so the scan ring stays level */}
        <lineLoop ref={ring} geometry={ringGeom} material={mats.ink} visible={false} />
      </group>
      <primitive object={trail} />
    </>
  )
}
