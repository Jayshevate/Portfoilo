/*
 * Renders anything from profile.js. A placeholder renders as a visible,
 * dashed "[missing: ...]" tag so nobody can mistake it for a real claim.
 */
import { isFill } from '../content/profile'

export default function Value({ v }) {
  if (isFill(v))
    return (
      <span className="whitespace-nowrap rounded-sm border border-dashed border-missing/70 px-1.5 font-mono text-[0.8em] text-missing">
        missing: {v.fill}
      </span>
    )
  if (Array.isArray(v))
    return v.map((x, i) => (
      <span key={i}>
        {i > 0 && ', '}
        <Value v={x} />
      </span>
    ))
  return v ?? null
}
