/*
 * The trailer: seven title cards, about 2.8 seconds each, built only from
 * facts in profile.js. Space pauses, ←/→ step, Esc closes. With reduced
 * motion it doesn't auto-advance; you step through it yourself.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { profile } from '../content/profile'
import { titleById } from '../content/catalog'
import Art from './Art'

const SHOT_MS = 2800

function useShots() {
  return useMemo(() => {
    const [ccp, ai] = profile.credentials
    return [
      { kicker: profile.city, line: `${profile.education.year}.`, art: 'carepilot' },
      { kicker: 'One engineer', line: 'Cloud. Backend. Security.', art: 'sensorium' },
      { kicker: ccp.name, line: `${ccp.result.replace('/', ' out of ')}.`, art: 'aws-ccp' },
      { kicker: ai.name, line: `${ai.result.split('/')[0]}.`, art: 'ai-900' },
      { kicker: 'DYPIU PhD ERP', line: 'Sole developer. Now in pilot.', art: 'phd-erp' },
      { kicker: 'Also showing', line: 'CarePilot · RentFlow · Sensorium Nexus · BazaarLens', art: 'bazaarlens' },
      { kicker: 'Now casting', line: `${profile.targeting.join(' · ')}.`, art: 'rentflow', end: true },
    ]
  }, [])
}

export default function Trailer({ onClose, onContact }) {
  const shots = useShots()
  const [i, setI] = useState(0)
  const reduced = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [paused, setPaused] = useState(reduced.current)
  const box = useRef(null)

  useEffect(() => {
    if (paused || i === shots.length - 1) return
    const t = setTimeout(() => setI((n) => n + 1), SHOT_MS)
    return () => clearTimeout(t)
  }, [i, paused, shots.length])

  useEffect(() => {
    const back = document.activeElement
    box.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setI((n) => Math.min(shots.length - 1, n + 1))
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
      else if (e.key === ' ') (e.preventDefault(), setPaused((p) => !p))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      back?.focus?.()
    }
  }, [onClose, shots.length])

  const shot = shots[i]
  return (
    <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Trailer" className="fixed inset-0 z-50 overflow-hidden bg-night outline-none">
      <div key={i} aria-hidden="true" className="absolute inset-0 opacity-50 motion-safe:animate-[rise_1.2s_ease-out_both]">
        <Art title={titleById[shot.art]} className="h-full w-full motion-safe:animate-[zoom_2.8s_linear_both]" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/30" />
      </div>

      {/* Story-style progress bars, one per shot. */}
      <ol className="absolute inset-x-4 top-4 flex gap-1.5 sm:inset-x-10" aria-hidden="true">
        {shots.map((_, n) => (
          <li key={n} className="h-0.5 flex-1 overflow-hidden bg-line">
            <span
              className="block h-full origin-left bg-marigold"
              style={
                n < i
                  ? { transform: 'scaleX(1)' }
                  : n === i && !paused
                    ? { animation: `shot-progress ${SHOT_MS}ms linear both` }
                    : { transform: n === i && paused ? 'scaleX(0.5)' : 'scaleX(0)' }
              }
            />
          </li>
        ))}
      </ol>

      <div className="relative flex h-full flex-col items-start justify-center px-6 sm:px-16" aria-live="polite">
        <p key={`k${i}`} className="font-mono text-xs uppercase tracking-[0.3em] text-marigold motion-safe:animate-rise sm:text-sm">{shot.kicker}</p>
        <p key={`l${i}`} className="mt-3 max-w-5xl font-display text-5xl font-black uppercase leading-[0.9] text-cream motion-safe:animate-rise sm:text-8xl">
          {shot.line}
        </p>
        {shot.end && (
          <div className="mt-8 flex flex-wrap gap-3 motion-safe:animate-rise">
            <button type="button" onClick={onContact} className="rounded-sm bg-marigold px-6 py-2.5 font-semibold text-night hover:bg-cream">Get in touch</button>
            <button type="button" onClick={onClose} className="rounded-sm bg-ash px-6 py-2.5 text-cream ring-1 ring-line hover:ring-marigold">Browse the catalogue</button>
          </div>
        )}
      </div>

      <div className="absolute inset-x-4 bottom-5 flex items-center justify-between font-mono text-xs text-dust sm:inset-x-10">
        <div className="flex gap-2">
          <button type="button" onClick={() => setI((n) => Math.max(0, n - 1))} className="rounded-sm px-2 py-1 ring-1 ring-line hover:text-cream" aria-label="Previous">←</button>
          <button type="button" onClick={() => setPaused((p) => !p)} className="rounded-sm px-3 py-1 ring-1 ring-line hover:text-cream">{paused ? 'Play' : 'Pause'}</button>
          <button type="button" onClick={() => setI((n) => Math.min(shots.length - 1, n + 1))} className="rounded-sm px-2 py-1 ring-1 ring-line hover:text-cream" aria-label="Next">→</button>
        </div>
        <span>{i + 1} / {shots.length}</span>
        <button type="button" onClick={onClose} className="rounded-sm px-3 py-1 ring-1 ring-line hover:text-cream">Skip trailer ✕</button>
      </div>
    </div>
  )
}
