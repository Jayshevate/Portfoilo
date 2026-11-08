# Jaykumar Shevate · on demand

My portfolio, built as a streaming catalogue. You pick who's watching
(recruiter, engineer, just looking), get a billboard with the essentials,
then rows of "titles": projects, credentials, experience and the stack.
Every title opens into its own page with "episodes" (problem → architecture
→ stack → my part). The trailer is a 20-second cut of the facts. The end
credits are the contact page.

It's meant to feel alive. The name slams in letter by letter, a marigold
ticker runs the real highlights, and every poster moves: CarePilot's record
route flows, RentFlow's windows flicker, Sensorium's waves scroll, BazaarLens's
boxes race, and the PhD ERP's student token hops. Projects get big "now
showing" numerals. All of it switches off under `prefers-reduced-motion`.

The idea: recruiters already know how to use a streaming app. They find what
they need in seconds, and the site is still memorable.

**For recruiters: the 60-second brief.** Right under the billboard (for
recruiters; after the rows for everyone else):
- **Why me for…** each target role, with only the facts that back it. A role
  with no evidence yet says "missing" instead of being padded.
- **Logistics:** location, start date, work mode, work authorization.
- **Act:** email me, download the résumé, or **copy a clean plain-text summary**
  to paste into an applicant-tracking system. The copied summary leaves out
  anything not filled in yet.

```bash
npm install
npm run dev        # http://localhost:5173
```

Nothing is deployed and there's no backend. The build is plain static files
that any static host can serve.

---

## Before sending the link to anyone

All facts live in **`src/content/profile.js`**. Anything I haven't written yet
is `fill('...')` and shows on the site as a red dashed **missing: …** tag, so
nothing gets made up.

```bash
npm run todo       # lists every missing fact
```

- **Resume PDF:** put it in `public/`, then set `links.resume` to e.g.
  `'/Jaykumar-Shevate-Resume.pdf'`. The Résumé button then appears in the
  top bar and in the credits.
- **Contact form:** get a free key at https://web3forms.com, copy
  `.env.example` to `.env.local` and set `VITE_WEB3FORMS_KEY`. Until then the
  form says it isn't connected; it never pretends to send.
- **Screenshots:** add `screenshots: [{ src: '/shots/x.webp', alt: '…' }]`
  to a project and they appear on its page.
- The tagline and the call-to-action (`cta`) are drafts. Rewrite them in your
  own words.

---

## Checking it

```bash
npm run check      # everything below, in order
npm test           # unit tests (Vitest)
npm run build      # production build + pre-render
npm run test:e2e   # browser tests (Playwright + axe), against the build
npm run test:load  # 200 parallel connections against the build
```

If Playwright can't find a browser on your machine:
`npx playwright install chromium`.

**Unit tests** (`tests/unit/`, 22 tests)

- `facts.test.js`: every score, date, title and employer must match the
  resume exactly. If someone edits a number by mistake, this fails.
- `catalog.test.js`: unique ids, every viewer's rows exist, search only finds
  real words (e.g. "kubernetes" finds nothing, because it isn't on the resume).
- `render.test.jsx`: renders the whole page the way the build does and fails
  on `undefined`, `NaN`, `[object Object]` or `null` anywhere in the text.
- `storage.test.js`: the site still works when the browser blocks storage.
- `brief.test.js`: every "why me" proof is built from text already in
  `profile.js`, and the ATS summary has no placeholders or garbage.

**Browser tests** (`tests/e2e/run.mjs`, 17 scenarios, real Chromium)

- the recruiter brief comes first, and "Copy summary" puts a clean profile on
  the clipboard
- the viewer picker sets the order of the rows and is remembered
- all 17 titles open, show no rendering garbage, close with Esc, and return
  keyboard focus to the card
- shared links (`#title=carepilot`) open straight to the title (no picker),
  Back closes it, and unknown ids are ignored
- search, My list, Continue watching, the trailer (play, pause, step, close)
- the contact form enforces its fields and never fakes success
- keyboard: first Tab is "Skip to the catalogue"; dialogs keep focus inside
- **axe-core WCAG 2.1 AA scan** of the picker, home, a title page and the
  trailer: zero violations
- phone viewport: no sideways scrolling (this caught long "missing" tags
  widening the page)
- reduced motion: zero running animations, and the trailer doesn't auto-advance
- blocked storage, and **JavaScript turned off** (all content still readable)
- **25 visitors at once**, in parallel browser contexts: each gets the right
  rows and their own My list, with no errors

**Load test** (`tests/load/run.mjs`): 200 parallel connections for 10 s on
the page and on the main script. Last run: about 9,800 page requests and
43,000 script requests, **0 errors, 0 timeouts, 0 non-200**, p99 latency
274 ms and 63 ms. That's on `vite preview`, a dev-grade server; a real static
host or CDN does better.

Why many recruiters at once is safe: there is no server code and no shared
state. Every visitor downloads the same static files; "My list", "Continue
watching" and the viewer choice live in that visitor's own browser. The only
outside call is the contact form, and each submission is independent.

**Lighthouse 12** (measured locally):

| | Performance | Accessibility | Best practices | SEO | First paint | Layout shift |
|---|---|---|---|---|---|---|
| Phone (slow 4G) | 99 | 100 | 100 | 100 | 1.6 s | 0.005 |
| Desktop | 100 | 100 | 100 | 100 | 0.4 s | 0.001 |

---

## How it works (the interview version)

### One data file, one derived catalogue
- `src/content/profile.js` holds the facts. It's plain data, so Node can run it
  too (the tests and the pre-render import it).
- `src/content/catalog.js` turns those facts into **titles** (anything you can
  open) and **rows**. It also holds `VIEWERS`: each viewer is just a row order.
  A recruiter sees credentials first, an engineer sees projects first.
  Everyone can reach everything.

### Pre-rendered, then hydrated
`npm run build` builds the app, then builds `src/entry-server.jsx` for Node,
and `scripts/prerender.mjs` renders `<App/>` to HTML into `dist/index.html`. So:
- the first response already contains every project, credential and job
  (good for slow phones, search engines and link previews)
- with JavaScript off, the whole catalogue is still readable
- React then *hydrates* that HTML (`hydrateRoot` in `src/main.jsx`)

For hydration to work, the first client render must match the server HTML
exactly. That's why anything from the browser (storage, the URL hash) is read
in a `useEffect` *after* the first render (see `App.jsx`).

### No flash of the picker
A 3-line inline script in `index.html` runs before paint: if this visitor
already picked a viewer, or arrived on a shared `#title=` link, it adds
`html.skip-gate`, and CSS hides the picker immediately. Once React is running
it adds `.hydrated` and takes over.

### State without a state library
Five `useState`s in `App.jsx`: viewer, picker open, My list, recently opened,
search query. The open title lives in the **URL hash** (`#title=id`,
`src/lib/hash.js`), which gives shareable links and a working Back button for
free. Storage goes through `src/lib/storage.js`, which never throws (private
windows and blocked cookies make `localStorage` throw).

### Posters without images
`src/components/Art.jsx` draws every poster in SVG from the title's id: a
pipeline of stamped approvals for the PhD ERP, a hospital network with one
record's route for CarePilot, a lit-up building for RentFlow, sensor waves for
Sensorium Nexus, racing price lanes for BazaarLens (the cheapest wins, not the
fastest), and big result numbers for credentials. A seeded random generator
keeps each poster identical on every visit and between server and client.
No image downloads at all.

### Accessible by construction
- Cards are real `<button>`s and rows are `<ul>`s under headings.
- Title pages and the trailer are dialogs: focus moves in, Tab stays inside,
  Esc closes, focus returns to where you were. The page behind is `inert`.
- Placeholders are visibly labelled "missing", never styled as content.
- Colours are checked for 4.5:1 contrast; animations respect
  `prefers-reduced-motion` (the trailer stops auto-advancing).

### Performance
- About 58 KB of gzipped JS in total. No 3D, no animation library.
- The fonts the first screen needs are preloaded (the pre-render step adds
  `<link rel="preload">`), so headlines don't reflow when fonts arrive.
- Tailwind only ships the classes actually used (about 6 KB of gzipped CSS).

---

## Files

```
src/
  content/profile.js     every fact (the only file to edit for content)
  content/catalog.js     titles, rows, viewers, search
  content/brief.js       role fit + ATS summary (facts mapped, never added)
  lib/storage.js         localStorage that never throws
  lib/hash.js            #title=id ⇄ open title
  components/
    Gate.jsx             "Who's here?"
    NavBar.jsx           wordmark, sections, search ("/"), résumé, viewer
    Billboard.jsx        hero + drifting poster wall + highlights ticker
    Brief.jsx            the recruiter's 60-second brief
    Row.jsx · TitleCard.jsx · Art.jsx
    TitlePage.jsx        the title dialog (facts, episodes, more like this)
    Trailer.jsx          the 7-shot trailer (2.8 s a shot)
    Credits.jsx          contact + form + credits roll
    Value.jsx            renders a fact or a "missing" tag
  App.jsx · main.jsx · entry-server.jsx · index.css
scripts/prerender.mjs    HTML pre-render + font preloads
scripts/todo.mjs         lists missing facts
tests/unit · tests/e2e · tests/load
CLAUDE.md                the coding rules this repo follows
```

Stack: React 18, Vite 5, Tailwind CSS 3, Vitest, Playwright, axe-core,
autocannon. Fonts: Big Shoulders Display and IBM Plex Sans/Mono, self-hosted.
