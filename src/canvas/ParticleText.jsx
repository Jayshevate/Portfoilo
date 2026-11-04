/*
 * ParticleText — text made of particles that can collapse into the packet.
 *
 * How the text positions are made:
 *   1. Draw the words with the real web font onto an offscreen 2D canvas.
 *   2. Read the pixels back and keep every pixel that is "ink".
 *   3. Randomly pick N of those pixels and map them into world units.
 * No font files or SDF atlases are needed in the 3D scene at all.
 *
 * Used twice: the hero (name → packet) and the response (packet → "200 OK").
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import vert from './shaders/particles.vert'
import frag from './shaders/particles.frag'
import { C, rng } from './kit'
import { packetState } from '../core/store'
import { quality } from '../core/quality'

const FONT = '"Instrument Serif", Georgia, serif'

function sampleText(lines, count, seed) {
  const W = 1200
  const H = 300 * lines.length
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((line, i) => {
    let size = 290
    ctx.font = `400 ${size}px ${FONT}`
    // Shrink long lines so every line fits the canvas width.
    const w = ctx.measureText(line).width
    if (w > W * 0.94) size *= (W * 0.94) / w
    ctx.font = `400 ${size}px ${FONT}`
    ctx.fillText(line, W / 2, 150 + i * 300)
  })
  const data = ctx.getImageData(0, 0, W, H).data
  const ink = []
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4] > 140) ink.push(x, y)

  const r = rng(seed)
  const out = new Float32Array(count * 2)
  const n = ink.length / 2
  for (let i = 0; i < count; i++) {
    const k = Math.floor(r() * n) * 2
    out[i * 2] = (ink[k] / W - 0.5) // -0.5..0.5 across
    out[i * 2 + 1] = -(ink[k + 1] - H / 2) / W // same scale vertically
  }
  return out
}

export default function ParticleText({
  lines,
  center = [0, 0, 0],
  getIntro, // () => 0..1
  getMorph, // () => 0..1  (0 = text, 1 = packet)
  getOpacity = () => 1,
  seed = 7,
  onReady,
}) {
  const viewport = useThree((s) => s.viewport)
  const camera = useThree((s) => s.camera)
  const [geo, setGeo] = useState(null)
  const count = quality.particles

  // Text needs the web font loaded first, or the canvas silently uses a fallback.
  useEffect(() => {
    let alive = true
    document.fonts.load(`400 100px ${FONT}`).finally(() => {
      if (!alive) return
      const pts = sampleText(lines, count, seed)
      const r = rng(seed + 1)
      const text = new Float32Array(count * 3)
      const scatter = new Float32Array(count * 3)
      const sphere = new Float32Array(count * 3)
      const rand = new Float32Array(count)
      for (let i = 0; i < count; i++) {
        text[i * 3] = pts[i * 2]
        text[i * 3 + 1] = pts[i * 2 + 1]
        text[i * 3 + 2] = (r() - 0.5) * 0.02
        // Start scattered in a wide, shallow slab around the text.
        scatter[i * 3] = (r() - 0.5) * 3
        scatter[i * 3 + 1] = (r() - 0.5) * 1.6
        scatter[i * 3 + 2] = (r() - 0.5) * 1.5
        // Uniform point on a unit sphere (for the packet shape).
        const u = r() * 2 - 1
        const a = r() * Math.PI * 2
        const s = Math.sqrt(1 - u * u)
        sphere.set([s * Math.cos(a), u, s * Math.sin(a)], i * 3)
        rand[i] = r()
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(text, 3)) // needed for bounds; shader uses aText
      g.setAttribute('aText', new THREE.BufferAttribute(text, 3))
      g.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3))
      g.setAttribute('aSphere', new THREE.BufferAttribute(sphere, 3))
      g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
      setGeo(g)
      onReady?.()
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uMorph: { value: 0 },
          uSize: { value: 30 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, quality.dpr || 1) },
          uPacket: { value: new THREE.Vector3() },
          uPacketRadius: { value: 0.17 },
          uInvScale: { value: 1 },
          uInk: { value: C.ink },
          uAccent: { value: C.accent },
          uOpacity: { value: 1 },
        },
      }),
    [],
  )

  /*
   * The particle positions are normalised (text ~1 unit wide) and the group
   * is scaled up to the real width. So the packet's world position has to be
   * converted into the group's local space every frame, and anything sized
   * in world units (packet radius, noise) gets divided by the scale.
   */
  const group = useRef()
  const local = useMemo(() => new THREE.Vector3(), [])

  // Text width: 11 units on desktop, narrower on a portrait phone.
  const dist = new THREE.Vector3(...center).distanceTo(camera.position) || 12
  const visibleW = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist * (viewport.aspect || 1)
  const width = Math.min(8.6, visibleW * 0.86)

  useFrame((state) => {
    if (!geo) return
    const u = mat.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uIntro.value = getIntro()
    u.uMorph.value = getMorph()
    u.uOpacity.value = getOpacity()
    group.current.visible = u.uOpacity.value > 0.01 && u.uMorph.value < 0.999
    local.fromArray(packetState.position)
    group.current.worldToLocal(local)
    u.uPacket.value.copy(local)
    u.uPacketRadius.value = 0.1 / width
    u.uInvScale.value = 1 / width
  })

  return (
    <group ref={group} position={center} scale={width}>
      {geo && <points geometry={geo} material={mat} frustumCulled={false} />}
    </group>
  )
}
