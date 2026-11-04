/*
 * Magnetic — wraps a link/button so it leans toward the cursor when the
 * cursor is close. gsap.quickTo gives a pre-built tween we can re-target on
 * every pointermove without allocating. Capped at `strength` px so it reads
 * as a nudge, never as the button running away. Off for touch and for
 * reduced motion.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { quality } from '../core/quality'

export default function Magnetic({ children, strength = 8, as: Tag = 'span', className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !quality.finePointer || quality.reducedMotion) return
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      x((dx / r.width) * strength * 2)
      y((dy / r.height) * strength * 2)
    }
    const leave = () => {
      x(0)
      y(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
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
