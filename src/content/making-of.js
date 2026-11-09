/*
 * The "Making of" extra: this site as its own case study. Everything here
 * is checkable in the public repository; the numbers are from the test runs
 * described in the README (re-run them with `npm run check`).
 */
export const REPO = 'https://github.com/Jayshevate/portfoilo'

export const makingOf = {
  id: 'this-site',
  kind: 'extra',
  name: 'Making of this site',
  tags: ['React', 'Tailwind', 'Testing'],
  logline: 'The portfolio you are looking at, as a case study: built, tested and documented like production work.',
  facts: [
    { label: 'Role', value: 'Designed, built and tested it' },
    { label: 'Backend', value: 'None: static files, works on any host' },
  ],
  episodes: [
    {
      name: 'The problem',
      body: 'A recruiter gives a portfolio under a minute. It has to answer "can this person do the job?" fast, and prove it, without inventing anything.',
    },
    {
      name: 'The architecture',
      body: 'Every fact lives in one data file. The app is rendered to static HTML at build time and hydrated by React, so it loads instantly and still reads with JavaScript off. Each visitor’s choices stay in their own browser: no server, no shared state.',
    },
    {
      name: 'The stack',
      body: 'React 18, Vite 5, Tailwind CSS 3. Tests: Vitest, Playwright, axe-core, autocannon.',
    },
    {
      name: 'The quality bar',
      body: 'Unit tests pin every score and date to the resume. Browser tests cover every flow, an automated WCAG 2.1 AA accessibility scan, 25 visitors at once, and 200 parallel connections with zero errors. Lighthouse: 99–100 across the board.',
    },
  ],
  links: [{ label: 'Source code', value: REPO }],
  screenshots: [],
  searchText: ['making of', 'this site', 'react', 'tailwind', 'vite', 'testing', 'playwright', 'accessibility'],
}
