/*
 * Tailored links: ?for=<company>&role=<role>
 *
 * When I apply somewhere I send a link like
 *   https://…/?for=Infosys&role=cloud
 * and the site greets that company and leads with that role. The values are
 * shown as plain text (React escapes them), trimmed, stripped of anything
 * that looks like markup, and capped at 40 characters.
 */
import { useEffect, useState } from 'react'

const ROLES = ['cloud', 'backend', 'security', 'devops']

const clean = (s) =>
  (s || '')
    .replace(/[<>{}\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40)

export function parseTailor(search) {
  const q = new URLSearchParams(search)
  const company = clean(q.get('for')) || null
  const r = clean(q.get('role')).toLowerCase()
  const role = ROLES.find((x) => r && (r === x || r.includes(x))) || null
  return company || role ? { company, role } : null
}

/** null on the server and first render (keeps hydration exact), then the real value. */
export function useTailor() {
  const [t, setT] = useState(null)
  useEffect(() => setT(parseTailor(window.location.search)), [])
  return t
}
