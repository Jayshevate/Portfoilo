/*
 * App — decides which version of the site you get, and lays out the page.
 *
 *  - The content (all the <section>s) is the same in both modes.
 *  - "experience": tall sticky sections + the lazy-loaded 3D canvas behind.
 *  - "simple": normal-height sections, no canvas, no smooth scroll. Chosen
 *    automatically for ?simple, no WebGL, or prefers-reduced-motion.
 */
import { Suspense, lazy, useEffect, useLayoutEffect } from 'react'
import { profile } from './content/profile'
import { useStore } from './core/store'
import { quality } from './core/quality'
import { destroyScroll, initScroll } from './core/scroll'
import { setSound } from './core/sound'
import TopBar from './dom/TopBar'
import Trace from './dom/Trace'
import Terminal from './dom/Terminal'
import Cursor from './dom/Cursor'
import Hero from './dom/sections/Hero'
import Certs from './dom/sections/Certs'
import About from './dom/sections/About'
import Project from './dom/sections/Project'
import Skills from './dom/sections/Skills'
import Contact from './dom/sections/Contact'

const Experience = lazy(() => import('./canvas/Experience'))

const params = new URLSearchParams(location.search)
const startSimple = params.has('simple') || !quality.webgl || (quality.reducedMotion && !params.has('3d'))

export default function App() {
  const mode = useStore((s) => s.mode)
  const ready = useStore((s) => s.canvasReady)
  const setMode = useStore((s) => s.setMode)
  const simple = mode === 'simple'

  useLayoutEffect(() => {
    if (startSimple) setMode('simple')
  }, [setMode])

  // (Re)build scroll handling whenever the layout changes between modes.
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.classList.toggle('is-simple', simple)
    if (simple) {
      destroyScroll()
      useStore.getState().setCanvasReady(false)
      if (useStore.getState().sound) {
        setSound(false)
        useStore.getState().setSound(false)
      }
      return
    }
    initScroll({ smooth: !quality.reducedMotion })
    return destroyScroll
  }, [simple])

  useEffect(() => {
    document.documentElement.classList.toggle('canvas-ready', ready && !simple)
  }, [ready, simple])

  return (
    <>
      {/* First thing a keyboard user reaches. */}
      <button type="button" className="skip" onClick={() => setMode(simple ? 'experience' : 'simple')}>
        {simple ? 'Play the 3D version' : 'Skip the animation: simple view'}
      </button>
      <TopBar />
      {!simple && (
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      )}
      {!simple && <Trace />}
      {!simple && <Cursor />}
      <div className="grain" aria-hidden="true" />
      {/* Filters used by CSS for hand-drawn edges (see notebook.css). */}
      <svg className="sr-only" aria-hidden="true" focusable="false">
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="3.2" />
        </filter>
        <filter id="rough-strong">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
      </svg>

      <main id="main">
        {simple && quality.reducedMotion && (
          <p className="notice">
            Your system asks for reduced motion, so you're seeing the simple view.{' '}
            <button type="button" onClick={() => setMode('experience')}>Play the 3D version anyway</button>
          </p>
        )}
        <Hero />
        <Certs />
        <About />
        {simple && <h2 className="simple-h">Work</h2>}
        {profile.projects.map((p, i) => (
          <Project key={p.slug} p={p} no={i} />
        ))}
        <Skills />
        <Contact />
      </main>
      <Terminal />
    </>
  )
}
