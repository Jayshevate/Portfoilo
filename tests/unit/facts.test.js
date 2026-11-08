/*
 * The facts on the site must match the resume exactly. If someone edits
 * profile.js and a score or date drifts, this fails before it ships.
 */
import { describe, expect, it } from 'vitest'
import { profile } from '../../src/content/profile.js'

const byId = Object.fromEntries(profile.credentials.map((c) => [c.id, c]))

describe('facts from the resume', () => {
  it('certification results and dates', () => {
    expect(byId['aws-ccp']).toMatchObject({ result: '1000/1000', date: 'Mar 2026', note: 'Valid through Mar 2029' })
    expect(byId['ai-900']).toMatchObject({ result: '929/1000', date: 'Mar 2026' })
    expect(byId['gate-2026']).toMatchObject({ result: 'Qualified' })
    expect(byId['aws-restart']).toMatchObject({ result: 'Completed', date: 'Sep 2025' })
  })

  it('experience titles, employers and dates', () => {
    expect(profile.experience.map((x) => [x.title, x.org, x.when])).toEqual([
      ['Teaching Associate', 'D. Y. Patil International University', 'Aug 2025 – present'],
      ['Software Developer Intern', 'Technocia Infotech', 'May – Aug 2025'],
      ['Cybersecurity Research Intern', 'FirstVidya Pvt. Ltd. (remote)', 'Feb – Apr 2025'],
    ])
  })

  it('education and identity', () => {
    expect(profile.education).toEqual({
      degree: 'B.Tech, Computer Science & Engineering (Cyber Security)',
      school: 'D. Y. Patil International University',
      year: '2026',
    })
    expect(profile.name).toBe('Jaykumar Chandrakant Shevate')
    expect(profile.location).toBe('Pune, Maharashtra, India')
  })

  it('the only project with known status/role is the PhD ERP', () => {
    const erp = profile.projects.find((p) => p.id === 'phd-erp')
    expect(erp).toMatchObject({ status: 'UAT / pilot stage', role: 'Sole developer' })
    expect(profile.projects.map((p) => p.name)).toEqual(['DYPIU PhD ERP', 'CarePilot', 'RentFlow', 'Sensorium Nexus', 'BazaarLens'])
  })
})
