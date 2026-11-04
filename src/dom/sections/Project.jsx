/*
 * One project district's case study. Fields follow the same order every
 * time (problem → architecture → stack → role → links) so a recruiter can
 * compare projects at a glance.
 */
import { isFill, realUrl } from '../../content/profile'
import Magnetic from '../Magnetic'
import Sheet from '../Sheet'
import Stop from '../Stop'
import Txt from '../Txt'

function LinkOrFill({ v, label }) {
  const url = realUrl(v)
  if (url && /^https?:/.test(url))
    return (
      <Magnetic>
        <a className="btn" href={url} target="_blank" rel="noreferrer">{label} ↗</a>
      </Magnetic>
    )
  return <span className="btn btn--off">{label}: {isFill(v) ? <Txt v={v} /> : v}</span>
}

export default function Project({ p, no }) {
  const id = `${p.slug}-title`
  return (
    <Stop id={p.slug} className="panel-left" labelledBy={id}>
      <Sheet no={no + 3} title={p.name.toUpperCase()}>
        <p className="kicker">service {String(no + 1).padStart(2, '0')} / 05 · <Txt v={p.status} /></p>
        <h2 id={id}>{p.name}</h2>
        <p className="lede">{p.kind}.</p>
        <p className="scene-note" aria-hidden="true">↳ in the drawing: {p.scene}</p>
        <dl className="case" data-lenis-prevent>
          <dt>Problem</dt><dd><Txt v={p.problem} /></dd>
          <dt>Architecture</dt><dd><Txt v={p.architecture} /></dd>
          <dt>Stack</dt><dd><Txt v={p.stack} /></dd>
          <dt>My role</dt><dd><Txt v={p.role} /></dd>
        </dl>
        <div className="links">
          <LinkOrFill v={p.repo} label="repo" />
          <LinkOrFill v={p.demo} label="demo" />
        </div>
      </Sheet>
    </Stop>
  )
}
