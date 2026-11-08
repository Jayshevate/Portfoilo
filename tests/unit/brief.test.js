import { describe, expect, it } from 'vitest'
import { fit, summary } from '../../src/content/brief.js'
import { profile, isFill } from '../../src/content/profile.js'

describe('recruiter brief', () => {
  it('covers every target role', () => {
    expect(fit.map((f) => f.role.toLowerCase()).sort()).toEqual(profile.targeting.map((t) => t.toLowerCase()).sort())
  })

  it('every proof is built from facts already in profile.js (or marked missing)', () => {
    const facts = JSON.stringify(profile)
    for (const f of fit)
      for (const p of f.proof) {
        if (isFill(p)) continue
        // each comma/colon-separated piece must appear verbatim in the profile
        for (const piece of p.split(/: |, | \(|\)/).filter(Boolean)) expect(facts, `"${piece}"`).toContain(piece)
      }
  })

  it('the ATS summary has the key facts and no placeholders or garbage', () => {
    const s = summary()
    for (const want of [profile.name, '1000/1000', '929/1000', 'Qualified', 'DYPIU PhD ERP', 'Sole developer']) expect(s).toContain(want)
    for (const bad of ['missing', '[object', 'undefined', 'NaN', 'null']) expect(s).not.toContain(bad)
  })
})
