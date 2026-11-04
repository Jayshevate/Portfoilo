/*
 * A pen-tip cursor: a red dot that follows instantly and a pencil ring that
 * follows with inertia (lerp each frame). Over anything clickable the ring
 * opens up. Only on fine pointers; text fields keep the native caret.
 */
import { useEffect, useRef } from 'react'
import { quality } from '../core/quality'

export default function Cursor() {
  const ring = useRef(null)
  const cross = useRef(null)

  useEffect(() => {
    if (!quality.finePointer) return
    document.documentElement.classList.add('has-cursor')
    let mx = -100, my = -100, rx = -100, ry = -100, raf
    const move = (e) => {
      mx = e.clientX
      my = e.clientY
      const hot = e.target.closest?.('a, button, [role="button"], input, textarea, summary')
      ring.current.classList.toggle('is-hot', !!hot)
    }
    const loop = () => {
      if (!ring.current) return
      const k = quality.reducedMotion ? 1 : 0.16
      rx += (mx - rx) * k
      ry += (my - ry) * k
      cross.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  if (!quality.finePointer) return null
  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring" />
      <div ref={cross} className="cursor__cross">
      </div>
    </div>
  )
}
