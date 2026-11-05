import { hero, ARROW_PATHS } from '../../content/hero'
import Stop from '../Stop'

/* Keep this markup in step with heroShell() in vite.config.js. */
export default function Hero() {
  return (
    <Stop id="edge" className="hero" labelledBy="hero-title">
      <div className="hero__inner">
        <p className="kicker">{hero.kicker}</p>
        {/* Real heading. In the 3D view the particles draw it; see sections.css. */}
        <h1 id="hero-title" className="hero__title">{hero.title}</h1>
        <p className="hero__line">{hero.line}</p>
        <p className="hero__meta">
          {hero.meta1}
          <br />
          {hero.meta2}
        </p>
        <p className="hero__hint" aria-hidden="true">
          <svg width="54" height="40" viewBox="0 0 54 40" className="hero__arrow">
            {ARROW_PATHS.map((d) => <path key={d} d={d} />)}
          </svg>
          {hero.hint}
        </p>
      </div>
    </Stop>
  )
}
