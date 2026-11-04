/*
 * Trace — a request-trace HUD down the right edge: every hop of the
 * journey, with the current one marked. It doubles as keyboard navigation
 * (each hop is a button). Desktop only; on phones the top bar covers it.
 */
import { STOPS } from '../core/route'
import { useStore } from '../core/store'
import { scrollToStop } from '../core/scroll'

export default function Trace() {
  const active = useStore((s) => s.activeStop)
  const idx = STOPS.findIndex((s) => s.id === active)
  return (
    <nav className="trace" aria-label="Journey">
      <p className="trace__head" aria-hidden="true">trace 7f3a·c1</p>
      <ol>
        {STOPS.map((s, i) => (
          <li key={s.id} className={i === idx ? 'is-now' : i < idx ? 'is-done' : ''}>
            <button type="button" onClick={() => scrollToStop(s.id)} aria-current={i === idx ? 'step' : undefined}>
              <span className="trace__dot" aria-hidden="true" />
              <span className="trace__label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
