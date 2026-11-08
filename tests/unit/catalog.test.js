import { describe, expect, it } from 'vitest'
import { titles, titleById, ROWS, VIEWERS, DEFAULT_VIEWER, search, similar } from '../../src/content/catalog.js'
import { isFill, real, fill } from '../../src/content/profile.js'
import { parseHash } from '../../src/lib/hash.js'

describe('catalog', () => {
  it('every title id is unique', () => {
    const ids = [...titles.map((t) => t.id), 'about']
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every viewer orders the same four rows, each row is non-empty', () => {
    for (const v of Object.values(VIEWERS)) expect([...v.rows].sort()).toEqual(Object.keys(ROWS).sort())
    for (const r of Object.values(ROWS)) {
      expect(r.ids.length).toBeGreaterThan(0)
      for (const id of r.ids) expect(titleById[id]).toBeTruthy()
    }
    expect(VIEWERS[DEFAULT_VIEWER]).toBeTruthy()
  })

  it('recruiters see credentials first, engineers see projects first', () => {
    expect(VIEWERS.recruiter.rows[0]).toBe('credentials')
    expect(VIEWERS.engineer.rows[0]).toBe('projects')
  })

  it('search matches every word, case-insensitively', () => {
    expect(search('AWS').map((t) => t.id).sort()).toEqual(['aws-ccp', 'aws-restart', 'skills-cloud'])
    expect(search('aws practitioner').map((t) => t.id)).toEqual(['aws-ccp'])
    expect(search('iot').map((t) => t.id)).toEqual(['sensorium'])
    expect(search('   ')).toEqual([])
    expect(search('kubernetes')).toEqual([]) // not on the resume, must not appear
  })

  it('placeholders are never searchable text', () => {
    for (const t of titles) for (const s of t.searchText) expect(isFill(s)).toBe(false)
  })

  it('"more like this" stays within the same kind', () => {
    for (const t of titles) for (const s of similar(t.id)) expect(s.kind).toBe(t.kind)
  })
})

describe('helpers', () => {
  it('fill / real', () => {
    expect(isFill(fill('x'))).toBe(true)
    expect(isFill(['a'])).toBe(false) // arrays have a .fill method
    expect(real(fill('x'))).toBe(null)
    expect(real('  ')).toBe(null)
    expect(real('https://a.b')).toBe('https://a.b')
  })

  it('parses the title hash', () => {
    expect(parseHash('#title=carepilot')).toBe('carepilot')
    expect(parseHash('#title=a%20b')).toBe('a b')
    expect(parseHash('')).toBe(null)
    expect(parseHash('#row-projects')).toBe(null)
  })
})
