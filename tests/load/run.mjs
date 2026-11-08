/*
 * Load test: many visitors hitting the built site at once.
 *
 *   npm run build && npm run test:load
 *
 * The site is static files (no server code of mine, no database), so the
 * question is only "does serving it break under concurrent requests?".
 * This hammers the page and its biggest asset with 200 parallel connections
 * for 10 s each and fails on any error or non-200 response.
 * Note: `vite preview` is a dev-grade server. A real static host / CDN is
 * faster still; this is a floor, not a ceiling.
 */
import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import autocannon from 'autocannon'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const up = () => fetch(BASE).then((r) => r.ok, () => false)

let server
if (!(await up())) {
  server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' })
  for (let i = 0; i < 50 && !(await up()); i++) await new Promise((r) => setTimeout(r, 200))
}

const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8')
const js = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1]
const targets = [['page', BASE], ['main script', new URL(js, BASE).href]]

let failed = false
for (const [name, url] of targets) {
  const r = await autocannon({ url, connections: 200, duration: 10 })
  const bad = r.errors + r.timeouts + r.non2xx
  failed ||= bad > 0
  console.log(
    `${bad ? '✗' : '✓'} ${name}: ${r.requests.total} requests, ${Math.round(r.requests.average)}/s, ` +
      `latency p50 ${r.latency.p50} ms · p99 ${r.latency.p99} ms, errors ${r.errors}, timeouts ${r.timeouts}, non-2xx ${r.non2xx}`,
  )
}
server?.kill()
process.exit(failed ? 1 : 0)
