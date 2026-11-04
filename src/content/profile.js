/*
 * profile.js — the ONE place where facts about me live.
 *
 * Every section, the terminal and the simple view read from here, so a fact
 * is never typed twice. Rule for this file: only what's on my resume.
 *
 *   fill('what')    → shows a hatched [FILL: what] marker on the page.
 *                     Replace it with a real string when I have the info.
 *   verify('text')  → shows the text with a [VERIFY] tag. Use for anything
 *                     (a number, a claim) I still need to double-check.
 *
 * Searching the codebase for "fill(" lists everything still missing.
 */

export const fill = (what) => ({ fill: what })
export const verify = (text) => ({ verify: text })

export const profile = {
  name: 'Jaykumar Chandrakant Shevate',
  displayName: 'Jaykumar Shevate',
  // Lines drawn by the hero particles. Kept short so it fits on a phone.
  particleName: ['JAYKUMAR', 'SHEVATE'],
  location: 'Pune, Maharashtra, India',
  role: 'Teaching Associate, D. Y. Patil International University',
  targeting: ['cloud', 'backend', 'junior DevOps', 'security'],
  freelance: true,
  spoken: ['English', 'Hindi', 'Marathi'],
  learning: ['German', 'Japanese', 'Russian'],

  // DRAFT tagline written from resume facts only. Rewrite in my own words.
  tagline:
    'I work on the parts of a system you only notice when they fail: the cloud underneath, the backend in the middle, and the security around both.',

  links: {
    github: fill('GitHub profile URL'),
    linkedin: fill('LinkedIn URL'),
    email: fill('email address'),
    // Put the PDF in /public and write e.g. '/Jaykumar-Shevate-Resume.pdf'
    resume: fill('resume PDF path'),
  },

  education: {
    degree: 'B.Tech, Computer Science & Engineering (Cyber Security)',
    school: 'D. Y. Patil International University',
    year: '2026',
    exams: [{ name: 'GATE 2026 (Data Science & AI)', result: 'Qualified' }],
  },

  certifications: [
    {
      id: 'aws-ccp',
      name: 'AWS Certified Cloud Practitioner',
      short: 'AWS CCP',
      score: '1000/1000',
      date: 'Mar 2026',
      valid: 'Valid through Mar 2029',
      verifyUrl: fill('Credly link'),
      gate: true, // gets a physical gate in the 3D Security Gate scene
    },
    {
      id: 'ai-900',
      name: 'Microsoft Azure AI Fundamentals (AI-900)',
      short: 'AI-900',
      score: '929/1000',
      date: 'Mar 2026',
      verifyUrl: fill('verification link'),
      gate: true,
    },
    {
      id: 'restart',
      name: 'AWS re/Start Graduate Program',
      short: 're/Start',
      score: 'Completed',
      date: 'Sep 2025',
      gate: false,
    },
  ],

  experience: [
    {
      title: 'Teaching Associate',
      org: 'D. Y. Patil International University',
      when: 'Aug 2025 – present',
      detail: fill('what I teach / what I achieved'),
    },
    {
      title: 'Software Developer Intern',
      org: 'Technocia Infotech',
      when: 'May – Aug 2025',
      detail: fill('what I built, tech used, outcome'),
    },
    {
      title: 'Cybersecurity Research Intern',
      org: 'FirstVidya Pvt. Ltd. (remote)',
      when: 'Feb – Apr 2025',
      detail: fill('what I researched, tools, outcome'),
    },
  ],

  /*
   * Projects, in the order the camera visits them.
   * `scene` is a plain description of the 3D metaphor (not a feature claim).
   */
  projects: [
    {
      slug: 'carepilot',
      name: 'CarePilot',
      kind: 'Healthcare SaaS / national health network',
      scene: 'Hospitals as a node graph. Records hop between them.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
    },
    {
      slug: 'rentflow',
      name: 'RentFlow',
      kind: 'Rental property management platform',
      scene: 'One building. Units change state as rent status changes.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
    },
    {
      slug: 'sensorium',
      name: 'Sensorium Nexus',
      kind: 'IoT monitoring platform',
      scene: 'Devices stream readings up into panels that redraw every frame.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
    },
    {
      slug: 'bazaarlens',
      name: 'BazaarLens',
      kind: 'AI shopping price comparison for India',
      scene: 'Stores race in lanes. The fastest answer is not the winner; the cheapest is.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
    },
    {
      slug: 'phd-erp',
      name: 'DYPIU PhD ERP',
      kind: 'Doctoral programme management system for D Y Patil International University',
      scene: 'A student token moves station to station, stamped at each approval.',
      status: 'UAT / pilot stage',
      role: 'Sole developer',
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link, or "private"'),
      demo: fill('demo link'),
    },
  ],

  skills: [
    { group: 'Cloud', items: ['AWS', 'Azure AI', fill('exact services used')] },
    { group: 'Backend · languages · frameworks', items: [fill('languages and frameworks')] },
    { group: 'Security', items: [fill('tools and areas')] },
    { group: 'Databases · tools · DevOps', items: [fill('databases, tools, CI/CD')] },
    { group: 'Learning now', items: ['Python', 'German', 'Japanese', 'Russian'] },
  ],

  contact: {
    // DRAFT call to action. Replace with my own line.
    cta: "Hiring for cloud, backend, junior DevOps or security? Or need something built freelance? Send the request back.",
  },
}

/* Small helpers used across the UI. */
// (Arrays have a .fill() method, so check for a plain object first.)
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
export const isFill = (v) => isObj(v) && 'fill' in v
export const isVerify = (v) => isObj(v) && 'verify' in v
/** Returns a real URL string, or null if the value is still a placeholder. */
export const realUrl = (v) => (typeof v === 'string' && v.length ? v : null)
/** Plain-text version of a value, for the terminal. */
export const plain = (v) =>
  isFill(v) ? `[FILL: ${v.fill}]` : isVerify(v) ? `${v.verify} [VERIFY]` : Array.isArray(v) ? v.map(plain).join(', ') : String(v)
