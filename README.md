# Life of a Request

My portfolio, told as one HTTP request travelling through a cloud system.
You scroll, the request moves: edge → security gate → load balancer → five
project "services" → data layer → back to you as a `200 OK`.

**Preview:** [`preview/life-of-a-request-preview.mp4`](preview/life-of-a-request-preview.mp4)
(60 s scroll-through, recorded headless without a GPU, so it's choppier than the real thing).

It's drawn like pages from a field notebook: manila paper, graphite text,
blue ballpoint for the 3D drawings, red pen for the request itself, and a
highlighter I only use on facts I can prove (scores, dates).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve that build locally
```

Useful URLs while developing:

- `/?simple` forces the simple, no-3D view (what recruiters in a hurry get)
- `/?3d` forces the 3D version even if the OS asks for reduced motion

Nothing is deployed. There's no backend.

---

## Before this goes in front of anyone: fill in the blanks

All facts live in **`src/content/profile.js`**. Anything I haven't written yet
is wrapped in `fill('...')` and shows up on the page as a red circled
`[FILL: ...]` note, so nothing gets made up. To find what's left:

```bash
grep -n "fill(" src/content/profile.js
```

What's still missing: GitHub / LinkedIn / email / resume links, cert
verification links, what I did in each role, and for each project its status,
role, problem, architecture, stack, and repo/demo links. The tagline and the
contact call-to-action are drafts written from resume facts; I should rewrite
them in my own words.

- **Resume PDF:** drop it in `public/` (e.g. `public/Jaykumar-Shevate-Resume.pdf`)
  and set `links.resume` to `'/Jaykumar-Shevate-Resume.pdf'`.
- **Contact form:** get a free key at https://web3forms.com, copy
  `.env.example` to `.env.local` and paste it in as `VITE_WEB3FORMS_KEY`. Until
  then the form tells visitors it isn't wired up, rather than pretending to send.

---

## How it works (the version I'd give in an interview)

### 1. One number drives everything

`src/core/scroll.js`

The page is a stack of real HTML `<section>`s, one per stop. Each is tall
(height comes from `vh` in `src/core/route.js`), and its panel is
`position: sticky`, so the text stays still while you scroll "through" it.

- **Lenis** smooths wheel scrolling (inertia, with my own easing curve in
  `src/core/ease.js`) but still uses native scroll, so keyboard, scrollbar,
  find-in-page and screen readers all keep working.
- **GSAP ScrollTrigger** watches every `[data-stop]` section and reports its
  progress from 0 to 1. Those numbers go into a plain object, `scroll.local`.
- GSAP's ticker drives Lenis, so there's exactly one animation clock.

`scroll` is deliberately **not** React state (`src/core/store.js`). It changes
on every scroll event; putting it in state would re-render the whole app 60
times a second. The 3D code just reads it inside `useFrame`. Things that change
rarely (which stop is active, terminal open, sound on) live in a small
**zustand** store.

### 2. The camera rides a spline

`src/core/route.js`, `src/canvas/CameraRig.jsx`

Every stop has a camera position and a look-at point. Two Catmull-Rom curves
run through them. Stop *k* sits exactly at parameter `k / (N-1)`, so
"progress inside section k" turns into "how far from stop k to stop k+1" via
a per-stop easing:

- `hero`: hold still while the name dissolves, then leave
- `linear`: keep moving (the security gate is a fly-through)
- `dwell`: drift slightly while you read, then travel in the last third

The rig doesn't jump to the target. It damps toward it (`1 - exp(-λ·dt)`, so
it's frame-rate independent), which adds a second layer of inertia on top of
Lenis. The mouse adds a little parallax.

To keep the 3D scene out from under the text panel, I don't move the camera.
I shift the **projection** with `camera.setViewOffset`: on desktop the world
renders right of centre, on phones it renders higher up.

### 3. The hero: text made of particles (custom GLSL #1)

`src/canvas/ParticleText.jsx`, `src/canvas/shaders/particles.vert`

1. Draw my name with the real web font onto a hidden 2D canvas.
2. Read the pixels back and keep the inked ones.
3. Pick N of them at random. Those are the particle positions.

Each particle carries three positions as attributes: scattered, in the name,
and on a sphere (the packet). The vertex shader blends scattered → name over
time when the page loads, then name → packet as you scroll. Each particle
starts at a slightly different moment (`aRand`), and halfway through the
collapse they're pushed through a noise field so they swirl instead of sliding
in a straight line. It's 11k particles in **one draw call**. The same component
plays backwards at the end to spell `200 OK`.

### 4. The packet and the security scan (custom GLSL #2)

`src/canvas/Packet.jsx`, `src/canvas/shaders/packet.frag`

The packet sits at a fixed spot in front of the camera, but in world space, so
it actually passes through the gates and leaves a trail (a ring buffer of its
last 48 positions). In the gate section a uniform `uScan` sweeps a bright band
from top to bottom, with "readout" stripes behind it, then the packet flashes
when it's accepted.

### 5. Gates that burn open (custom GLSL #3)

`src/canvas/scenes/Gate.jsx`, `src/canvas/shaders/dissolve.frag`

Each certification has a gate with a hatched membrane. When its scan finishes,
`uDissolve` goes from 0 to 1. Simplex noise decides which pixels are discarded
first, and a thin rim glows along the burning edge. The HTML cert list switches
from "scanning…" to a stamped "verified" at the same scroll point (it reads
`gateStage` from the store).

### 6. Hand-drawn lines that "boil" (custom GLSL #4)

`src/canvas/kit.js`

In hand-drawn animation every frame is re-traced, so lines shimmer slightly. I
patch three.js's line material with `onBeforeCompile` to add a tiny random
offset per vertex that changes **8 times a second**, not every frame; the
stepping is what makes it read as drawn. The offset is hashed from the vertex
position, so two segments sharing a corner move together and never split. It's
turned off for reduced motion.

Plus a blueprint grid floor (`ground.frag`) that uses `fwidth()` so lines stay
1px wide at any distance.

### 7. The five project scenes

`src/canvas/scenes/*.jsx`. Each is small and self-contained:

| Project | Metaphor | Technique |
|---|---|---|
| CarePilot | hospitals as a graph, records hop between them | k-nearest-neighbour graph, `InstancedMesh` dots on arcs |
| RentFlow | a building whose units change state | one instanced plane per unit, `setColorAt` |
| Sensorium Nexus | devices streaming readings into live charts | line buffers shifted one sample at a time |
| BazaarLens | stores race; the cheapest wins, not the fastest | per-race random durations and prices |
| DYPIU PhD ERP | a student token stamped at each station | token moves along a curve driven by scroll |

All the values in these are random or simulated. They illustrate the idea;
they aren't data from the real systems.

### 8. Performance

- **The HTML paints first.** The whole 3D canvas is a `React.lazy` chunk, so
  three.js (≈176 KB gzipped) downloads after the text is already readable.
- **Each scene is its own chunk** (0.5 to 2 KB each). Only the active stop, one
  behind and two ahead are mounted; the next ones are prefetched.
- **No models, no textures.** Everything is built from code (lines, a few
  instanced meshes), so there's nothing to download beyond JS and a few small
  font files. Paper grain is an SVG filter in CSS.
- **Shared materials.** Every line uses one of three materials, so the GPU
  compiles a handful of shader programs, not hundreds.
- **DPR capped** at 1.5 (1 on low-end), and drei's `PerformanceMonitor` drops
  the resolution if fps falls and raises it again when it recovers.
- **Device tiers** (`src/core/quality.js`): phones get a third of the
  particles, no antialiasing and fewer animated objects. There's no
  post-processing anywhere.

Current production build: about 105 KB gzipped of JS for first paint, plus
about 220 KB for the 3D chunks that load after it.

### 9. Accessibility and the simple view

- All content is real HTML: headings, lists, a table, a form. The canvas is
  `aria-hidden`. The `<h1>` stays in the DOM after the particles take over
  visually.
- The first Tab stop is **"Skip the animation: simple view"**. Simple view
  removes the canvas, smooth scroll and custom cursor, and shows the same
  content as one readable page.
- `prefers-reduced-motion` starts in the simple view (with a button to play the
  3D anyway), and turns off line boil and animations.
- The trace on the right edge is a list of buttons, so every stop can be
  reached by keyboard. Panels become visible when anything inside them has
  focus.

### 10. The little things

- **Terminal** (`~` or the button): `help`, `whoami`, `ls projects`,
  `open <project>` (Tab completes), `certs`, `contact`, `resume`, `simple`,
  `sound on|off`. Up/Down for history. It's a dialog with focus return and
  `aria-live` output. `src/dom/Terminal.jsx`
- **Magnetic links** (`src/dom/Magnetic.jsx`): `gsap.quickTo` leans the element
  toward the cursor, capped at 8px.
- **Cursor** (`src/dom/Cursor.jsx`): a red pen dot plus a pencil ring that
  lags behind it. Only on mouse/trackpad.
- **Sound** (`src/core/sound.js`): off by default and made with the Web Audio
  API (oscillators, filtered noise, a slow LFO), so there's no audio file. The
  filter opens a little at each stop, so the hum brightens as the request goes
  deeper.
- **Hand-drawn edges** (`src/styles/notebook.css`): page outlines, buttons and
  the "fill" circles go through an SVG displacement filter. It's applied to a
  separate border layer so the text inside stays sharp. Each page is tilted by
  an angle derived from its page number, so it's the same on every visit.

---

## File map

```
src/
  content/profile.js     every fact on the site (edit this one)
  core/
    route.js             the stops, the splines, the pacing
    scroll.js            Lenis + ScrollTrigger → scroll.local
    store.js             zustand store + the non-reactive scroll object
    quality.js           device tier, DPR, reduced motion, WebGL check
    ease.js              the house easing curve
    sound.js             Web Audio ambient
  canvas/
    Experience.jsx       <Canvas>, lazy scenes, perf monitor, boil clock
    CameraRig.jsx        camera on the spline + view offset
    Packet.jsx           the request + its trail
    ParticleText.jsx     text → particles → packet
    Ground.jsx           grid floor
    kit.js               palette, shared line materials, line boil, helpers
    shaders/             GLSL (particles, packet, dissolve, ground, noise)
    scenes/              one file per stop
  dom/
    sections/            the real HTML for each stop
    Stop.jsx             tall sticky section vs simple section
    Sheet.jsx            the taped notebook page
    Terminal.jsx · TopBar.jsx · Trace.jsx · Cursor.jsx · Magnetic.jsx · SoundToggle.jsx · Txt.jsx
  styles/
    tokens.css           colours + fonts (change the look here)
    base.css · sections.css · notebook.css
```

## Stack

Vite, React 18, three.js, @react-three/fiber, @react-three/drei, GSAP +
ScrollTrigger, Lenis, zustand, vite-plugin-glsl. Fonts: Young Serif and
Courier Prime (self-hosted via Fontsource).
