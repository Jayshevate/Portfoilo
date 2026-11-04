/*
 * CameraRig — moves the camera along the spline every frame.
 *
 * Scroll gives us a target parameter (scroll.camT). We don't jump to it: we
 * damp toward it, which adds a second layer of inertia on top of Lenis. The
 * pointer adds a few centimetres of parallax so the world feels handheld.
 *
 * setViewOffset shifts the *projection*, not the camera: on "side" stops the
 * scene renders right of centre to leave room for the HTML panel on the left
 * (on phones, it shifts up to leave room for the panel at the bottom).
 */
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { camCurve, lookCurve, STOPS, STOP_INDEX } from '../core/route'
import { scroll, useStore } from '../core/store'
import { damp } from './kit'
import { quality } from '../core/quality'

const pos = new THREE.Vector3()
const look = new THREE.Vector3()

export default function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const t = useRef(0)
  const offset = useRef(0)
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 })

  useEffect(() => {
    if (!quality.finePointer) return
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05) // a tab coming back from background shouldn't teleport
    t.current = damp(t.current, scroll.camT, 4.5, dt)

    camCurve.getPoint(t.current, pos)
    lookCurve.getPoint(t.current, look)

    const p = pointer.current
    p.sx = damp(p.sx, p.x, 2.5, dt)
    p.sy = damp(p.sy, p.y, 2.5, dt)
    pos.x += p.sx * 0.35
    pos.y -= p.sy * 0.2

    camera.position.copy(pos)
    camera.lookAt(look)

    // Frame offset: blend toward the active stop's framing.
    const stop = STOPS[STOP_INDEX[useStore.getState().activeStop]] || STOPS[0]
    const target = stop.frame === 'side' ? 1 : 0
    offset.current = damp(offset.current, target, 3, dt)
    const w = size.width
    const h = size.height
    const portrait = h > w
    const ox = portrait ? 0 : -w * 0.19 * offset.current
    const oy = portrait ? h * 0.2 * offset.current : 0
    camera.setViewOffset(w, h, ox, oy, w, h)
  })

  return null
}
