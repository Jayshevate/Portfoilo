/*
 * scroll.js — Lenis + GSAP ScrollTrigger glue.
 *
 * Lenis replaces the browser's wheel scrolling with an eased version (inertia),
 * but the page still scrolls natively, so scrollbars, keyboard, find-in-page and
 * screen readers all keep working. ScrollTrigger watches each
 * <section data-stop="..."> and reports its progress 0..1, which we write
 * into the non-reactive `scroll` object for the 3D world to read.
 */
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scroll, useStore } from './store'
import { cameraT } from './route'
import { requestEase } from './ease'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
let triggers = []
const raf = (time) => lenis?.raf(time * 1000)

export function initScroll({ smooth = true } = {}) {
  destroyScroll()

  if (smooth) {
    lenis = new Lenis({ duration: 1.3, easing: requestEase, wheelMultiplier: 0.85, touchMultiplier: 1.1 })
    lenis.on('scroll', (e) => {
      scroll.velocity = e.velocity
      ScrollTrigger.update()
    })
    // One clock for everything: GSAP's ticker drives Lenis.
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
  }

  const { setActiveStop, setGateStage } = useStore.getState()

  document.querySelectorAll('[data-stop]').forEach((el) => {
    const id = el.dataset.stop
    scroll.local[id] = 0
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom top', // sections are back to back: no gaps, no overlaps
        onUpdate: (self) => {
          const p = self.progress
          scroll.local[id] = p
          scroll.camT = cameraT(scroll.local)
          // Panels fade in/out with a class instead of per-frame styles.
          el.classList.toggle('is-on', id === 'edge' ? p < 0.42 : p > 0.03 && p < 0.7)
          if (id === 'gate') {
            const stage = p > 0.46 ? 2 : p > 0.16 ? 1 : 0
            if (stage !== useStore.getState().gateStage) setGateStage(stage)
          }
        },
        onToggle: (self) => self.isActive && setActiveStop(id),
      }),
    )
  })
  ScrollTrigger.refresh()
}

export function destroyScroll() {
  triggers.forEach((t) => t.kill())
  triggers = []
  if (lenis) {
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenis = null
  }
}

/**
 * Jump to a stop. `at` is where inside the section to land (0..1);
 * 0.3 is past the arrival and into the readable part.
 */
export function scrollToStop(id, at = 0.3) {
  const el = document.querySelector(`[data-stop="${id}"]`) || document.getElementById(id)
  if (!el) return
  const y = el.offsetTop + (el.dataset.stop ? el.offsetHeight * at : 0)
  if (lenis) lenis.scrollTo(y, { duration: 2.2 })
  else window.scrollTo({ top: y, behavior: useStore.getState().mode === 'simple' ? 'auto' : 'smooth' })
}
