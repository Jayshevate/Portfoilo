/*
 * Render the whole app to HTML (exactly what the pre-render step ships) and
 * check nothing broken or misleading leaks into the page.
 */
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from '../../src/App.jsx'
import { titles } from '../../src/content/catalog.js'
import { profile } from '../../src/content/profile.js'

const html = renderToString(<App />)
const text = html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')

describe('pre-rendered page', () => {
  it('contains every title and the key facts', () => {
    for (const t of titles) expect(text).toContain(t.name.replace(/&/g, '&'))
    expect(text).toContain(profile.displayName)
    expect(text).toContain('1000/1000')
    expect(text).toContain('929/1000')
  })

  it('has no rendering garbage', () => {
    for (const bad of ['undefined', 'NaN', '[object Object]', 'null'])
      expect(text, `found "${bad}"`).not.toMatch(new RegExp(`\\b${bad.replace(/[[\]]/g, '\\$&')}\\b`))
  })

  it('marks missing facts as missing, never as content', () => {
    expect(text).toContain('missing: GitHub profile URL')
    expect(html).not.toMatch(/href="\[object/)
  })

  it('has exactly one h1 visible to the page outline per screen', () => {
    // gate + billboard: two h1s, the gate is a dialog of its own
    expect((html.match(/<h1/g) || []).length).toBe(2)
  })
})
