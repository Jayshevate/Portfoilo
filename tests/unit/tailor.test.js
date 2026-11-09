import { describe, expect, it } from 'vitest'
import { parseTailor } from '../../src/lib/tailor.js'

describe('tailored links', () => {
  it('reads company and role', () => {
    expect(parseTailor('?for=Infosys&role=cloud')).toEqual({ company: 'Infosys', role: 'cloud' })
    expect(parseTailor('?for=Acme%20Corp&role=Junior%20DevOps')).toEqual({ company: 'Acme Corp', role: 'devops' })
    expect(parseTailor('?role=Security%20Engineer')).toEqual({ company: null, role: 'security' })
  })

  it('ignores unknown roles and empty links', () => {
    expect(parseTailor('?for=Acme&role=astronaut')).toEqual({ company: 'Acme', role: null })
    expect(parseTailor('')).toBe(null)
    expect(parseTailor('?for=%20%20')).toBe(null)
  })

  it('strips markup and caps the length', () => {
    const t = parseTailor('?for=' + encodeURIComponent('<img src=x onerror=alert(1)>Evil'))
    expect(t.company).not.toMatch(/[<>]/)
    expect(parseTailor('?for=' + 'x'.repeat(200)).company.length).toBe(40)
  })
})
