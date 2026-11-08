/*
 * profile.js — every fact on the site lives here, and nowhere else.
 *
 * Rule: only what is on my resume. If I don't have something yet, it is
 * `fill('what is missing')`, which the site shows as a clearly marked
 * placeholder instead of a guess. `npm run todo` lists all of them.
 *
 * Nothing in this file touches the browser, so it also runs in Node
 * (the pre-render step and the tests import it).
 */

export const fill = (what) => ({ fill: what })

export const profile = {
  name: 'Jaykumar Chandrakant Shevate',
  displayName: 'Jaykumar Shevate',
  location: 'Pune, Maharashtra, India',
  city: 'Pune',
  role: 'Teaching Associate, D. Y. Patil International University',
  targeting: ['cloud', 'backend', 'junior DevOps', 'security'],
  freelance: true,

  // What recruiters screen for first. Fill these in; until then the brief
  // shows them as missing (and the copied summary leaves them out).
  availability: fill('start date'), // e.g. 'July 2026, after graduation'
  workMode: fill('on-site / hybrid / remote'), // and whether I'd relocate
  workAuthorization: fill('work authorization'), // e.g. 'Indian citizen'
  spoken: ['English', 'Hindi', 'Marathi'],
  learning: ['German', 'Japanese', 'Russian'],

  // DRAFT, written only from resume facts. Rewrite in my own words.
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
  },

  credentials: [
    {
      id: 'aws-ccp',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      result: '1000/1000',
      date: 'Mar 2026',
      note: 'Valid through Mar 2029',
      verifyUrl: fill('Credly link'),
    },
    {
      id: 'ai-900',
      name: 'Microsoft Azure AI Fundamentals (AI-900)',
      issuer: 'Microsoft',
      result: '929/1000',
      date: 'Mar 2026',
      verifyUrl: fill('verification link'),
    },
    {
      id: 'gate-2026',
      name: 'GATE 2026, Data Science & AI',
      issuer: 'GATE',
      result: 'Qualified',
      date: '2026',
    },
    {
      id: 'aws-restart',
      name: 'AWS re/Start Graduate Program',
      issuer: 'Amazon Web Services',
      result: 'Completed',
      date: 'Sep 2025',
    },
  ],

  experience: [
    {
      id: 'dypiu-ta',
      title: 'Teaching Associate',
      org: 'D. Y. Patil International University',
      when: 'Aug 2025 – present',
      detail: fill('what I teach / what I achieved'),
    },
    {
      id: 'technocia',
      title: 'Software Developer Intern',
      org: 'Technocia Infotech',
      when: 'May – Aug 2025',
      detail: fill('what I built, tech used, outcome'),
    },
    {
      id: 'firstvidya',
      title: 'Cybersecurity Research Intern',
      org: 'FirstVidya Pvt. Ltd. (remote)',
      when: 'Feb – Apr 2025',
      detail: fill('what I researched, tools, outcome'),
    },
  ],

  // In the order they appear in the Projects row.
  projects: [
    {
      id: 'phd-erp',
      name: 'DYPIU PhD ERP',
      genre: ['Education', 'ERP'],
      logline: 'Doctoral programme management system for D Y Patil International University.',
      status: 'UAT / pilot stage',
      role: 'Sole developer',
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link, or "private"'),
      demo: fill('demo link'),
      screenshots: [], // optional: [{ src: '/shots/x.webp', alt: '...' }]
    },
    {
      id: 'carepilot',
      name: 'CarePilot',
      genre: ['Healthcare', 'SaaS'],
      logline: 'Healthcare SaaS / national health network.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
      screenshots: [],
    },
    {
      id: 'rentflow',
      name: 'RentFlow',
      genre: ['Property', 'Platform'],
      logline: 'Rental property management platform.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
      screenshots: [],
    },
    {
      id: 'sensorium',
      name: 'Sensorium Nexus',
      genre: ['IoT', 'Monitoring'],
      logline: 'IoT monitoring platform.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
      screenshots: [],
    },
    {
      id: 'bazaarlens',
      name: 'BazaarLens',
      genre: ['AI', 'Shopping'],
      logline: 'AI shopping price comparison for India.',
      status: fill('status'),
      role: fill('my role'),
      problem: fill('problem it solves'),
      architecture: fill('architecture notes'),
      stack: fill('stack'),
      repo: fill('repo link'),
      demo: fill('demo link'),
      screenshots: [],
    },
  ],

  skills: [
    { group: 'Cloud', items: ['AWS', 'Azure AI', fill('exact services used')] },
    { group: 'Backend', items: [fill('languages and frameworks')] },
    { group: 'Security', items: [fill('tools and areas')] },
    { group: 'Data & DevOps', items: [fill('databases, tools, CI/CD')] },
    { group: 'Learning now', items: ['Python', 'German', 'Japanese', 'Russian'] },
  ],

  // Optional: other repos worth a look. [{ name, url, line }]. Hidden while empty.
  otherRepos: [],

  // DRAFT call to action. Replace with my own line.
  cta: 'Hiring for cloud, backend, junior DevOps or security? Or need something built freelance? Get in touch.',
}

/* ---------- helpers ---------- */

// Arrays have a .fill() method, so check for a plain object first.
export const isFill = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && 'fill' in v

/** A real string value, or null while it's still a placeholder. */
export const real = (v) => (typeof v === 'string' && v.trim() ? v : null)
