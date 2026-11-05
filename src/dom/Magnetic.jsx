/*
 * Magnetic — wraps a link/button so it leans toward the cursor when the
 * cursor is over it, and springs back when it leaves.
 *
 * A tiny damped spring on requestAnimationFrame, instead of GSAP, so this
 * file (which every section uses) doesn't pull GSAP into the first-paint
 * bundle. Capped at `strength` px so it reads as a nudge. Off for touch and
 * for reduced motion.
 */
import { useEffect, useRef } from 'react'
import { quality } from '../core/quality'

const STIFF = 0.14 // pull toward the target each frame
const DAMP = 0.72 // how much velocity survives each frame (springy, not bouncy)

export default function Magnetic({ children, strength = 8, as: Tag = 'span', className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !quality.finePointer || quality.reducedMotion) return
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0

    const tick = () => {
      vx = (vx + (tx - x) * STIFF) * DAMP
      vy = (vy + (ty - y) * STIFF) * DAMP
      x += vx
      y += vy
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      // Stop the loop once it has settled, so idle links cost nothing.
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.05) raf = requestAnimationFrame(tick)
      else raf = 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * strength * 2
      ty = ((e.clientY - (r.top + r.height / 2)) / r.height) * strength * 2
      kick()
    }
    const leave = () => {
      tx = 0
      ty = 0
      kick()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])

  return (
    <Tag ref={ref} className={`magnetic ${className}`}>
      {children}
    </Tag>
  )
}
