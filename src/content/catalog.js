/*
 * catalog.js — turns profile.js into "titles" and "rows", the two shapes the
 * whole UI is built from. A title is anything you can open: a project, a
 * credential, a job, a skill group. Nothing new is invented here; every
 * string comes from profile.js.
 */
import { profile, real } from './profile.js'

const projectTitle = (p) => ({
  id: p.id,
  kind: 'project',
  name: p.name,
  tags: p.genre,
  logline: p.logline,
  facts: [
    { label: 'Status', value: p.status },
    { label: 'Role', value: p.role },
  ],
  episodes: [
    { name: 'The problem', body: p.problem },
    { name: 'The architecture', body: p.architecture },
    { name: 'The stack', body: p.stack },
    { name: 'My part in it', body: p.role },
  ],
  links: [
    { label: 'Repository', value: p.repo },
    { label: 'Live demo', value: p.demo },
  ],
  screenshots: p.screenshots,
  searchText: [p.name, p.logline, ...p.genre, real(p.stack), real(p.role)],
})

const credentialTitle = (c) => ({
  id: c.id,
  kind: 'credential',
  name: c.name,
  tags: [c.issuer, c.date],
  logline: [c.result, c.note].filter(Boolean).join(' · '),
  result: c.result,
  facts: [
    { label: 'Result', value: c.result },
    { label: 'Issued', value: c.date },
    ...(c.note ? [{ label: 'Validity', value: c.note }] : []),
  ],
  episodes: [],
  links: c.verifyUrl !== undefined ? [{ label: 'Verify', value: c.verifyUrl }] : [],
  screenshots: [],
  searchText: [c.name, c.issuer, c.result],
})

const experienceTitle = (x) => ({
  id: x.id,
  kind: 'experience',
  name: x.title,
  tags: [x.org, x.when],
  logline: `${x.org} · ${x.when}`,
  facts: [
    { label: 'Where', value: x.org },
    { label: 'When', value: x.when },
  ],
  episodes: [{ name: 'What I did', body: x.detail }],
  links: [],
  screenshots: [],
  searchText: [x.title, x.org],
})

const skillTitle = (s) => ({
  id: `skills-${s.group.toLowerCase().replace(/[^a-z]+/g, '-')}`,
  kind: 'skill',
  name: s.group,
  tags: [],
  logline: s.items.filter((i) => typeof i === 'string').join(', '),
  items: s.items,
  facts: [],
  episodes: [{ name: 'In this group', body: s.items }],
  links: [],
  screenshots: [],
  searchText: [s.group, ...s.items.filter((i) => typeof i === 'string')],
})

const about = {
  id: 'about',
  kind: 'about',
  name: profile.displayName,
  tags: [profile.city, profile.education.year],
  logline: profile.tagline,
  facts: [
    { label: 'Now', value: profile.role },
    { label: 'Studying', value: `${profile.education.degree}, ${profile.education.school}, ${profile.education.year}` },
    { label: 'Based in', value: profile.location },
    { label: 'Looking for', value: `${profile.targeting.join(', ')} roles${profile.freelance ? '; open to freelance' : ''}` },
    { label: 'Speaks', value: profile.spoken.join(', ') },
    { label: 'Learning', value: profile.learning.join(', ') },
  ],
  episodes: [],
  links: [
    { label: 'GitHub', value: profile.links.github },
    { label: 'LinkedIn', value: profile.links.linkedin },
  ],
  screenshots: [],
  searchText: [profile.name, profile.city, ...profile.spoken, ...profile.learning],
}

export const titles = [
  ...profile.projects.map(projectTitle),
  ...profile.credentials.map(credentialTitle),
  ...profile.experience.map(experienceTitle),
  ...profile.skills.map(skillTitle),
]

// `about` can be opened (billboard "More info") and searched, but isn't in a row.
export const titleById = Object.fromEntries([...titles, about].map((t) => [t.id, t]))

export const ROWS = {
  projects: { name: 'Projects', ids: titles.filter((t) => t.kind === 'project').map((t) => t.id) },
  credentials: { name: 'Credentials', ids: titles.filter((t) => t.kind === 'credential').map((t) => t.id) },
  experience: { name: 'Experience', ids: titles.filter((t) => t.kind === 'experience').map((t) => t.id) },
  stack: { name: 'The stack', ids: titles.filter((t) => t.kind === 'skill').map((t) => t.id) },
}

/*
 * Who's watching decides the order of the rows, nothing else: every viewer
 * can reach everything. A recruiter sees proof first, an engineer sees the
 * work first.
 */
export const VIEWERS = {
  recruiter: { label: 'Recruiter', hint: 'Credentials and experience first', rows: ['credentials', 'experience', 'projects', 'stack'] },
  engineer: { label: 'Engineer', hint: 'The projects and the stack first', rows: ['projects', 'stack', 'credentials', 'experience'] },
  curious: { label: 'Just looking', hint: 'The highlights', rows: ['projects', 'credentials', 'experience', 'stack'] },
}
export const DEFAULT_VIEWER = 'recruiter'

/** Case-insensitive search over the words each title is made of. */
export function search(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return [...titles, about].filter((t) => {
    const hay = t.searchText.filter(Boolean).join(' ').toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

/** Titles of the same kind, for "More like this". */
export const similar = (id) => {
  const t = titleById[id]
  return t ? titles.filter((x) => x.kind === t.kind && x.id !== id) : []
}
