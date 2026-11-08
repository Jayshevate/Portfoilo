/*
 * After `vite build`, render the app to HTML once and put it in
 * dist/index.html. Visitors (and search engines) get the full content in
 * the first response; React then hydrates it.
 */
import { readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { render } from '../dist-ssr/entry-server.js'

const file = new URL('../dist/index.html', import.meta.url)
const html = await readFile(file, 'utf8')
if (!html.includes('<!--app-->')) throw new Error('dist/index.html has no <!--app--> placeholder')
// Preload the fonts the first screen uses, so text doesn't reflow when they arrive.
const fonts = (await readdir(new URL('../dist/assets', import.meta.url))).filter((f) =>
  /^(big-shoulders-display-latin-(800|900)|ibm-plex-sans-latin-400)-normal-.*\.woff2$/.test(f),
)
const preload = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`).join('\n    ')
await writeFile(file, html.replace('<!--app-->', render()).replace('</title>', `</title>\n    ${preload}`))
await rm(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true })
console.log('prerendered dist/index.html')
