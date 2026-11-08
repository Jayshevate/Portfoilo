/*
 * brief.js — the recruiter's view of profile.js:
 *   fit       one line per target role, with only the facts that back it
 *   summary   plain text for pasting into an applicant-tracking system
 *
 * It maps existing facts onto roles; it never adds new ones. A role with no
 * evidence yet says so instead of being padded.
 */
import { profile, real, fill } from './profile.js'

const cred = Object.fromEntries(profile.credentials.map((c) => [c.id, c]))
const job = Object.fromEntries(profile.experience.map((x) => [x.id, x]))
const erp = profile.projects.find((p) => p.id === 'phd-erp')

export const fit = [
  {
    role: 'Cloud',
    proof: [
      `${cred['aws-ccp'].name}: ${cred['aws-ccp'].result}`,
      `${cred['ai-900'].name}: ${cred['ai-900'].result}`,
      `${cred['aws-restart'].name} (${cred['aws-restart'].date})`,
    ],
  },
  {
    role: 'Backend',
    proof: [`${erp.role}, ${erp.name} (${erp.status})`, `${job.technocia.title}, ${job.technocia.org}`],
  },
  {
    role: 'Security',
    proof: [profile.education.degree, `${job.firstvidya.title}, ${job.firstvidya.org}`],
  },
  {
    role: 'Junior DevOps',
    proof: [cred['aws-restart'].name, fill('DevOps work (CI/CD, Docker, Linux)')],
  },
]

/** Plain-text profile. Missing fields are skipped, never printed as placeholders. */
export function summary() {
  const line = (label, v) => (real(v) ? `${label}: ${v}` : null)
  return [
    `${profile.name}`,
    `${profile.role} · ${profile.location}`,
    `Looking for: ${profile.targeting.join(', ')} roles${profile.freelance ? '; open to freelance' : ''}`,
    line('Available', profile.availability),
    line('Work mode', profile.workMode),
    line('Work authorization', profile.workAuthorization),
    '',
    `Education: ${profile.education.degree}, ${profile.education.school}, ${profile.education.year}`,
    'Credentials:',
    ...profile.credentials.map((c) => `- ${c.name}: ${c.result} (${c.date})`),
    'Experience:',
    ...profile.experience.map((x) => `- ${x.title}, ${x.org}, ${x.when}`),
    'Projects:',
    ...profile.projects.map((p) => `- ${p.name}: ${p.logline}${real(p.role) ? ` Role: ${p.role}.` : ''}${real(p.status) ? ` Status: ${p.status}.` : ''}`),
    `Languages: ${profile.spoken.join(', ')}`,
    '',
    line('Email', profile.links.email),
    line('GitHub', profile.links.github),
    line('LinkedIn', profile.links.linkedin),
  ]
    .filter((l) => l !== null)
    .join('\n')
    .trim()
}
