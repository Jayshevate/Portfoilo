import { profile } from '../../content/profile'
import Stop from '../Stop'

export default function Hero() {
  const e = profile.education
  return (
    <Stop id="edge" className="hero" labelledBy="hero-title">
      <div className="hero__inner">
        <p className="kicker">GET /jaykumar-shevate HTTP/1.1 · host: pune.in</p>
        {/* Real heading. Visually replaced by the particle name once WebGL is ready. */}
        <h1 id="hero-title" className="hero__title">{profile.displayName}</h1>
        <p className="hero__line">{profile.tagline}</p>
        <p className="hero__meta">
          {e.degree.replace('Computer Science & Engineering', 'CSE')} · {e.school} · {e.year}
          <br />
          Teaching Associate there since Aug 2025 · {profile.location.split(',')[0]}
        </p>
        <p className="hero__hint" aria-hidden="true">
          <svg width="54" height="40" viewBox="0 0 54 40" className="hero__arrow">
            <path d="M3 6 C 14 2, 30 4, 34 16 S 30 33, 22 34" />
            <path d="M28 28 L 21 34.5 L 29.5 37" />
          </svg>
          scroll. you are the request.
        </p>
      </div>
    </Stop>
  )
}
