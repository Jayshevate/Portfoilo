# Working on this repo

These are the rules this codebase was written to (adapted from the
Karpathy-inspired coding guidelines). Follow them for every change.

1. **Think before coding.** Say what you're about to change and why. If a
   request is ambiguous, ask instead of guessing.
2. **Simplicity first.** The minimum code that solves the problem. No new
   dependency, abstraction or config option unless something real needs it.
   Plain React state + Tailwind classes; no state library, no router.
3. **Surgical changes.** Touch only what the task needs. Don't reformat or
   "tidy" unrelated code in the same change.
4. **Goal-driven.** Every change ends with the checks passing:
   `npm run check` (unit tests, build, browser tests, load test).

Project rules:

- **Facts live only in `src/content/profile.js`.** Never invent a metric,
  employer, user count, link or outcome. Unknown → `fill('what is missing')`.
  `tests/unit/facts.test.js` pins the resume facts; update it only when the
  resume changes.
- Styling is Tailwind utility classes; colours and fonts are defined once in
  `tailwind.config.js`.
- The first client render must match the pre-rendered HTML: read
  `window`/`localStorage`/the URL only inside effects.
