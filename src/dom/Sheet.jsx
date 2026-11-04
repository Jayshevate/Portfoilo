/*
 * Sheet — every content panel is a page taped into the notebook.
 *
 *  - The outline is drawn on its own layer and pushed through an SVG
 *    turbulence filter (#rough, defined in App.jsx), so the border wobbles
 *    like a pen line but the text inside stays perfectly crisp.
 *  - Each page sits at a slightly different angle. The angle comes from the
 *    page number, not Math.random(), so it's the same on every visit.
 *  - A strip of tape holds it down; the footer is the page's label.
 */
export default function Sheet({ no, title, children, className = '' }) {
  const tilt = (((no * 37) % 9) - 4) * 0.18 // -0.72deg .. +0.72deg
  const tapeX = 30 + ((no * 53) % 40) // tape lands somewhere along the top
  return (
    <div className={`sheet ${className}`} style={{ '--tilt': `${tilt}deg`, '--tape-x': `${tapeX}%` }}>
      <span className="sheet__edge" aria-hidden="true" />
      <span className="sheet__tape" aria-hidden="true" />
      <div className="sheet__body">{children}</div>
      <div className="sheet__block" aria-hidden="true">
        <span>p. {String(no).padStart(2, '0')}</span>
        <span>{title.toLowerCase()}</span>
        <span>jcs</span>
      </div>
    </div>
  )
}
