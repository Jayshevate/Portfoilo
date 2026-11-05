import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import { hero, ARROW_PATHS } from './src/content/hero.js'
import { STOPS } from './src/core/route.js'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/*
 * Writes the hero into index.html at build/dev time, so the first thing a
 * visitor sees (on a slow phone, before ~60 KB of JS arrives) is real text,
 * not a blank page. React replaces it when it mounts; the markup matches the
 * Hero component so nothing moves when that happens.
 */
function heroShell() {
  const vh = STOPS[0].vh
  return `<main id="main" class="shell-main"><section class="stop hero is-on shell" style="--shell-h:${vh}vh">
<div class="stop__sticky"><div class="hero__inner">
<p class="kicker">${esc(hero.kicker)}</p>
<h1 class="hero__title">${esc(hero.title)}</h1>
<p class="hero__line">${esc(hero.line)}</p>
<p class="hero__meta">${esc(hero.meta1)}<br>${esc(hero.meta2)}</p>
<p class="hero__hint" aria-hidden="true"><svg width="54" height="40" viewBox="0 0 54 40" class="hero__arrow">${ARROW_PATHS.map((d) => `<path d="${d}"/>`).join('')}</svg>${esc(hero.hint)}</p>
</div></div></section></main>`
}

const prerenderHero = () => ({
  name: 'prerender-hero',
  transformIndexHtml: (html) => html.replace('<div id="root"></div>', `<div id="root">${heroShell()}</div>`),
})

// glsl() lets us `import frag from './x.frag'` as a string and supports #include.
export default defineConfig({
  plugins: [react(), glsl({ compress: true }), prerenderHero()],
  build: {
    target: 'es2020',
    // three.js is big; keep it in its own long-cached chunk.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber'],
        },
      },
    },
  },
})
