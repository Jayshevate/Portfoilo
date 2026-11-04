/*
 * Stop — one stop of the journey as a <section>.
 *
 * Experience mode: the section is tall (vh from route.js) and its panel is
 * position: sticky, so the text stays put while the 3D world moves behind it.
 * ScrollTrigger reads the section's data-stop attribute.
 *
 * Simple mode: same content, normal height, no data-stop, no stickiness.
 */
import { STOPS, STOP_INDEX } from '../core/route'
import { useStore } from '../core/store'

export default function Stop({ id, children, className = '', labelledBy }) {
  const simple = useStore((s) => s.mode === 'simple')
  const stop = STOPS[STOP_INDEX[id]]
  if (simple) {
    return (
      <section id={id} className={`stop stop--simple ${className}`} aria-labelledby={labelledBy}>
        {children}
      </section>
    )
  }
  return (
    <section
      id={id}
      data-stop={id}
      className={`stop ${className} ${id === 'edge' ? 'is-on' : ''}`}
      style={stop.vh ? { height: `${stop.vh}vh` } : undefined}
      aria-labelledby={labelledBy}
    >
      <div className="stop__sticky">{children}</div>
    </section>
  )
}
