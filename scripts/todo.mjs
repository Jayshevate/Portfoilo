// npm run todo — lists every fact still missing from src/content/profile.js,
// so I know exactly what to fill in before sending the link to anyone.
import { profile, isFill } from '../src/content/profile.js'

const missing = []
const walk = (v, path) => {
  if (isFill(v)) return missing.push(`${path}  →  ${v.fill}`)
  if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`))
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k)
}
walk(profile, '')

const extras = []
if (!profile.photo) extras.push('photo (optional)')
if (!profile.otherRepos.length) extras.push('otherRepos (optional)')
const noShots = profile.projects.filter((p) => !p.screenshots.length).map((p) => p.slug)
if (noShots.length) extras.push(`screenshots for: ${noShots.join(', ')} (optional)`)
if (!process.env.VITE_WEB3FORMS_KEY) extras.push('VITE_WEB3FORMS_KEY in .env.local (contact form)')

console.log(`\n${missing.length} blanks still in profile.js:\n`)
missing.forEach((m) => console.log('  ' + m))
console.log(`\nAlso not set yet:\n`)
extras.forEach((m) => console.log('  ' + m))
console.log('\nPlus: rewrite the DRAFT tagline and contact.cta in your own words.\n')
