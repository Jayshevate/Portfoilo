/*
 * Edge (hero). The name assembles from scattered ink over ~2.4s once the
 * particles are ready, then scrolling collapses it into the packet that
 * starts the journey.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import ParticleText from '../ParticleText'
import { profile } from '../../content/profile'
import { scroll, useStore } from '../../core/store'
import { smooth } from '../../core/route'
import { quality } from '../../core/quality'

export default function Edge({ position }) {
  const ready = useRef(false)
  const start = useRef(null)
  const intro = useRef(quality.reducedMotion ? 1 : 0)

  useFrame((state) => {
    if (!ready.current || quality.reducedMotion) return
    if (start.current === null) start.current = state.clock.elapsedTime
    intro.current = Math.min(1, (state.clock.elapsedTime - start.current) / 2.4)
  })

  return (
    <ParticleText
      lines={profile.particleName}
      center={[position[0], position[1] + 1.15, position[2]]}
      seed={11}
      getIntro={() => intro.current}
      getMorph={() => smooth(0.02, 0.46, scroll.local.edge ?? 0)}
      onReady={() => {
        ready.current = true
        useStore.getState().setCanvasReady(true)
      }}
    />
  )
}
