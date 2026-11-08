// npm run todo — every fact still missing from src/content/profile.js.
import { profile, isFill } from '../src/content/profile.js'

const missing = []
const walk = (v, path) => {
  if (isFill(v)) return missing.push(`${path}  →  ${v.fill}`)
  if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`))
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k)
}
walk(profile, '')

console.log(`\n${missing.length} things still missing in src/content/profile.js:\n`)
for (const m of missing) console.log('  ' + m)
console.log('\nOptional: screenshots per project, otherRepos, VITE_WEB3FORMS_KEY in .env.local.')
console.log('Also: rewrite the DRAFT tagline and cta in your own words.\n')
