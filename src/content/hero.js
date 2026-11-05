/*
 * The hero's words, derived from profile.js. Shared by the React Hero and by
 * the build step in vite.config.js that writes the same hero straight into
 * index.html, so text shows up before any JavaScript has loaded.
 */
import { profile } from './profile.js'

const e = profile.education
export const hero = {
  kicker: 'GET /jaykumar-shevate HTTP/1.1 · host: pune.in',
  title: profile.displayName,
  line: profile.tagline,
  meta1: `${e.degree.replace('Computer Science & Engineering', 'CSE')} · ${e.school} · ${e.year}`,
  meta2: `Teaching Associate there since Aug 2025 · ${profile.location.split(',')[0]}`,
  hint: 'scroll. you are the request.',
}

export const ARROW_PATHS = ['M3 6 C 14 2, 30 4, 34 16 S 30 33, 22 34', 'M28 28 L 21 34.5 L 29.5 37']
