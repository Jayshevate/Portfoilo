/*
 * End-to-end tests in a real browser, against the production build.
 *
 *   npm run build && npm run test:e2e
 *
 * Starts `vite preview` if nothing is listening on :4173, runs every
 * scenario below, prints a pass/fail line each, exits non-zero on failure.
 * Uses Playwright + axe-core (accessibility rules, WCAG 2.1 AA).
 * If Playwright can't find a browser: npx playwright install chromium
 */
import { spawn } from 'node:child_process'
import { chromium, devices } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const results = []
let server

async function up() {
  try {
    return (await fetch(BASE)).ok
  } catch {
    return false
  }
}

async function ensureServer() {
  if (await up()) return
  server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' })
  for (let i = 0; i < 50 && !(await up()); i++) await new Promise((r) => setTimeout(r, 200))
  if (!(await up())) throw new Error('preview server did not start (did you run npm run build?)')
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

/** A fresh visitor: new context = empty storage, like a different person. */
async function visitor(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 }, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.errors = errors
  return { ctx, page }
}

const rowOrder = (page) => page.$$eval('section[aria-labelledby^="row-"] h2', (hs) => hs.map((h) => h.textContent.trim()))
const visibleText = (page) => page.evaluate(() => document.body.innerText)

async function axe(page, label) {
  await page.waitForTimeout(700) // let entrance animations finish; axe measures what's on screen
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  assert(!r.violations.length, `${label}: ${r.violations.map((v) => `${v.id} (${v.nodes.length})`).join(', ')}`)
}

/* ---------------- scenarios ---------------- */

const tests = {
  async 'new visitor sees "Who\'s here?", recruiter gets credentials first, choice is remembered'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('dialog', { name: "Who's here?" }).waitFor()
    await page.getByRole('button', { name: /Recruiter/ }).click()
    assert((await rowOrder(page))[0] === 'Credentials', `order was ${await rowOrder(page)}`)
    await page.reload()
    assert(!(await page.locator('[data-gate]').isVisible()), 'gate shown again after reload')
    assert((await rowOrder(page))[0] === 'Credentials', 'order not remembered')
    assert(!page.errors.length, page.errors.join('\n'))
    await ctx.close()
  },

  async 'recruiter brief: shown first, role fit + logistics, copies a clean summary'(b) {
    const { ctx, page } = await visitor(b)
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    const brief = page.locator('#brief')
    await brief.waitFor()
    const briefTop = await brief.evaluate((e) => e.getBoundingClientRect().top + scrollY)
    const rowTop = await page.locator('#row-credentials').evaluate((e) => e.getBoundingClientRect().top + scrollY)
    assert(briefTop < rowTop, 'brief should come before the rows for recruiters')
    const text = await brief.innerText()
    for (const s of ['CLOUD', 'BACKEND', 'SECURITY', 'JUNIOR DEVOPS', '1000/1000', 'Logistics'.toUpperCase()])
      assert(text.toUpperCase().includes(s), `brief is missing ${s}`)
    await page.getByRole('button', { name: /Copy summary/ }).click()
    await page.getByRole('button', { name: /Copied/ }).waitFor()
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    assert(clip.startsWith('Jaykumar Chandrakant Shevate') && clip.includes('1000/1000') && !clip.includes('missing'), `bad summary: ${clip.slice(0, 120)}`)
    await ctx.close()
  },

  async 'tailored link: greets the company, leads with their role, no picker, markup stays text'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE + '?for=Infosys&role=security')
    await page.locator('[data-tailored]', { hasText: 'Prepared for Infosys' }).waitFor()
    assert(!(await page.locator('[data-gate]').isVisible()), 'picker shown on a tailored link')
    assert((await page.title()).includes('Infosys'), 'tab title not tailored')
    const first = await page.$eval('#brief [data-role]', (e) => e.dataset.role)
    assert(first === 'Security', `first role card is ${first}`)
    await page.locator('[data-clock]').first().getByText(/\d\d:\d\d/).waitFor()

    let fired = false
    page.on('dialog', async (d) => ((fired = true), d.dismiss()))
    await page.goto(BASE + '?for=' + encodeURIComponent('<img src=x onerror=alert(1)>Evil'))
    await page.locator('[data-tailored]').waitFor()
    assert(!(await page.locator('[data-tailored] img').count()) && !fired, 'markup in ?for= was rendered')
    assert(!page.errors.length, page.errors.join('\n'))
    await ctx.close()
  },

  async 'engineer gets projects first; switching viewer works'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Engineer/ }).click()
    assert((await rowOrder(page))[0] === 'Projects', `order was ${await rowOrder(page)}`)
    await page.getByRole('button', { name: /Watching as/ }).click()
    await page.getByRole('button', { name: /Recruiter/ }).click()
    assert((await rowOrder(page))[0] === 'Credentials', 'switch did not reorder')
    await ctx.close()
  },

  async 'every title opens, shows its name, closes with Esc and returns focus'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Skip — show me everything/ }).click()
    const ids = await page.$$eval('#rows [data-title]', (els) => [...new Set(els.map((e) => e.dataset.title))])
    assert(ids.length === 18, `expected 18 titles, found ${ids.length}`)
    for (const id of ids) {
      const card = page.locator(`#rows [data-title="${id}"]`).first()
      await card.scrollIntoViewIfNeeded()
      await card.click()
      const dlg = page.getByRole('dialog').filter({ has: page.locator('#title-name') })
      await dlg.waitFor()
      assert(page.url().endsWith(`#title=${id}`), `hash not set for ${id}`)
      const text = await dlg.innerText()
      for (const bad of ['undefined', 'NaN', '[object Object]']) assert(!text.includes(bad), `${id} shows "${bad}"`)
      await page.keyboard.press('Escape')
      await dlg.waitFor({ state: 'detached' })
      const focused = await page.evaluate(() => document.activeElement?.dataset?.title)
      assert(focused === id, `focus went to ${focused}, not ${id}`)
    }
    assert(!page.errors.length, page.errors.join('\n'))
    await ctx.close()
  },

  async 'deep link opens a title; Back closes it'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE + '#title=phd-erp')
    await page.locator('#title-name', { hasText: 'DYPIU PhD ERP' }).waitFor()
    assert(!(await page.locator('[data-gate]').isVisible()), 'gate covers a shared link')
    assert((await visibleText(page)).includes('Sole developer'), 'ERP role missing')
    await page.keyboard.press('Escape')
    await page.locator('#title-name').waitFor({ state: 'detached' })
    // open from a card, then the browser Back button closes it
    await page.locator('#rows [data-title="carepilot"]').first().click()
    await page.locator('#title-name', { hasText: 'CarePilot' }).waitFor()
    await page.goBack()
    await page.locator('#title-name').waitFor({ state: 'detached' })
    // a bogus id must not crash or show a broken dialog
    await page.goto(BASE + '#title=does-not-exist')
    await page.waitForTimeout(300)
    assert(!(await page.locator('#title-name').count()), 'dialog opened for unknown id')
    assert(!page.errors.length, page.errors.join('\n'))
    await ctx.close()
  },

  async 'search finds by word, says when nothing matches, "/" focuses it'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    await page.keyboard.press('/')
    assert(await page.evaluate(() => document.activeElement?.type === 'search'), '"/" did not focus search')
    await page.keyboard.type('aws')
    await page.getByRole('heading', { name: /Results for “aws”/ }).waitFor()
    assert((await page.locator('#rows [data-title]').count()) === 3, 'expected 3 results for aws')
    await page.fill('input[type=search]', 'kubernetes')
    await page.getByRole('heading', { name: /Nothing matches/ }).waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('heading', { name: 'Credentials' }).waitFor()
    await ctx.close()
  },

  async 'My list: add, see the row, survives reload, remove'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Engineer/ }).click()
    await page.goto(BASE + '#title=sensorium')
    await page.getByRole('button', { name: '+ My list' }).click()
    await page.keyboard.press('Escape')
    await page.getByRole('heading', { name: 'My list' }).waitFor()
    await page.reload()
    await page.getByRole('heading', { name: 'My list' }).waitFor()
    await page.goto(BASE + '#title=sensorium')
    await page.getByRole('button', { name: '✓ On my list' }).click()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    assert(!(await page.getByRole('heading', { name: 'My list' }).count()), 'My list row still there after removing')
    assert((await page.getByRole('heading', { name: 'Continue watching' }).count()) === 1, 'Continue watching row missing')
    await ctx.close()
  },

  async 'trailer plays, advances, pauses, closes'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    await page.getByRole('button', { name: /Play trailer/ }).click()
    const dlg = page.getByRole('dialog', { name: 'Trailer' })
    await dlg.waitFor()
    await page.getByText('1 / 7').waitFor()
    await page.getByText('2 / 7').waitFor({ timeout: 6000 })
    await page.keyboard.press(' ')
    await page.waitForTimeout(4000)
    assert(await page.getByText('2 / 7').isVisible(), 'trailer kept going while paused')
    await page.keyboard.press('ArrowRight')
    await page.getByText('3 / 7').waitFor()
    assert((await dlg.innerText()).includes('1000 OUT OF 1000') || (await dlg.innerText()).toLowerCase().includes('1000 out of 1000'), 'shot 3 should state the AWS score')
    await page.keyboard.press('Escape')
    await dlg.waitFor({ state: 'detached' })
    await ctx.close()
  },

  async 'contact form: required fields enforced; without a key it says so, never fakes success'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    await page.locator('#credits').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Send' }).click()
    assert(!(await page.getByText(/Sent\./).count()), 'empty form claimed success')
    await page.getByLabel('Name').fill('A Recruiter')
    await page.getByLabel('Email').fill('recruiter@example.com')
    await page.getByLabel('Message').fill('Hello')
    await page.getByRole('button', { name: 'Send' }).click()
    await page.getByText(/isn't connected yet|Sent\.|didn't go through/).waitFor()
    const status = await page.getByRole('status').innerText()
    if (!process.env.VITE_WEB3FORMS_KEY) assert(status.includes("isn't connected yet"), `unexpected status: ${status}`)
    await ctx.close()
  },

  async 'keyboard: first Tab is the skip link; dialogs trap focus'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    await page.keyboard.press('Tab')
    assert((await page.evaluate(() => document.activeElement.textContent)).includes('Skip to the catalogue'), 'first Tab is not the skip link')
    await page.goto(BASE + '#title=rentflow')
    await page.locator('#title-name').waitFor()
    for (let i = 0; i < 25; i++) await page.keyboard.press('Tab')
    assert(await page.evaluate(() => !!document.activeElement.closest('[role=dialog]')), 'focus escaped the dialog')
    await ctx.close()
  },

  async 'accessibility (axe, WCAG 2.1 AA): gate, home, title page, trailer'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await axe(page, 'gate')
    await page.getByRole('button', { name: /Recruiter/ }).click()
    await axe(page, 'home')
    await page.goto(BASE + '#title=carepilot')
    await page.locator('#title-name').waitFor()
    await axe(page, 'title page')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /Play trailer/ }).click()
    await page.getByRole('dialog', { name: 'Trailer' }).waitFor()
    await page.keyboard.press(' ')
    await axe(page, 'trailer')
    await ctx.close()
  },

  async 'phone: no sideways scrolling, everything reachable'(b) {
    const { ctx, page } = await visitor(b, { ...devices['iPhone 13'] })
    await page.goto(BASE)
    await page.getByRole('button', { name: /Just looking/ }).click()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    assert(overflow <= 0, `page is ${overflow}px wider than the screen`)
    await page.locator('[data-title="bazaarlens"]').first().scrollIntoViewIfNeeded()
    await page.locator('[data-title="bazaarlens"]').first().click()
    await page.locator('#title-name', { hasText: 'BazaarLens' }).waitFor()
    await page.getByRole('button', { name: 'Close' }).click()
    await ctx.close()
  },

  async 'reduced motion: nothing animates, trailer waits for you'(b) {
    const { ctx, page } = await visitor(b, { reducedMotion: 'reduce' })
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)
    assert(running === 0, `${running} animations still running`)
    await page.getByRole('button', { name: /Play trailer/ }).click()
    await page.waitForTimeout(3500)
    assert(await page.getByText('1 / 7').isVisible(), 'trailer auto-advanced under reduced motion')
    await ctx.close()
  },

  async 'still works when the browser blocks storage'(b) {
    const { ctx, page } = await visitor(b)
    await ctx.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })
    })
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    await page.goto(BASE + '#title=ai-900')
    await page.locator('#title-name').waitFor()
    await page.getByRole('button', { name: '+ My list' }).click()
    assert(!page.errors.length, page.errors.join('\n'))
    await ctx.close()
  },

  async 'without JavaScript the whole catalogue is still readable'(b) {
    const { ctx, page } = await visitor(b, { javaScriptEnabled: false })
    await page.goto(BASE)
    assert(!(await page.locator('[data-gate]').isVisible()), 'gate blocks the page without JS')
    const text = await visibleText(page)
    for (const s of ['Jaykumar Shevate', '1000/1000', '929/1000', 'CarePilot', 'Teaching Associate', 'Roll credits', '60-second brief'])
      assert(text.includes(s) || text.toUpperCase().includes(s.toUpperCase()), `missing "${s}" without JS`)
    await ctx.close()
  },

  async 'nothing on the page claims something missing: placeholders are labelled'(b) {
    const { ctx, page } = await visitor(b)
    await page.goto(BASE)
    await page.getByRole('button', { name: /Recruiter/ }).click()
    const text = await visibleText(page)
    for (const bad of ['undefined', 'NaN', '[object Object]', 'Lorem']) assert(!text.includes(bad), `page shows "${bad}"`)
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))
    for (const h of hrefs) assert(h && !h.includes('[object') && !h.includes('undefined'), `broken link: ${h}`)
    await ctx.close()
  },

  async '25 visitors at the same time, each with their own state'(b) {
    const N = 25
    const viewers = ['Recruiter', 'Engineer', 'Just looking']
    const first = { Recruiter: 'Credentials', Engineer: 'Projects', 'Just looking': 'Projects' }
    const ids = ['carepilot', 'rentflow', 'sensorium', 'bazaarlens', 'phd-erp', 'aws-ccp', 'ai-900']
    const runs = Array.from({ length: N }, async (_, i) => {
      const { ctx, page } = await visitor(b)
      const who = viewers[i % 3]
      const pick = ids[i % ids.length]
      await page.goto(BASE)
      await page.getByRole('button', { name: new RegExp(who) }).click()
      assert((await rowOrder(page))[0] === first[who], `visitor ${i}: wrong first row`)
      await page.goto(BASE + `#title=${pick}`)
      await page.locator('#title-name').waitFor()
      await page.getByRole('button', { name: '+ My list' }).click()
      await page.keyboard.press('Escape')
      const mine = await page.$$eval('[aria-labelledby="row-mylist"] [data-title]', (els) => els.map((e) => e.dataset.title))
      assert(mine.length === 1 && mine[0] === pick, `visitor ${i}: My list is ${mine}, expected only ${pick}`)
      assert(!page.errors.length, `visitor ${i}: ${page.errors.join(' | ')}`)
      await ctx.close()
    })
    await Promise.all(runs)
  },
}

/* ---------------- runner ---------------- */

await ensureServer()
const browser = await chromium.launch()
const only = process.argv[2]
for (const [name, fn] of Object.entries(tests)) {
  if (only && !name.includes(only)) continue
  const t0 = Date.now()
  try {
    await fn(browser)
    results.push([true, name, Date.now() - t0])
    console.log(`  ✓ ${name} (${Date.now() - t0} ms)`)
  } catch (e) {
    results.push([false, name, e.message])
    console.log(`  ✗ ${name}\n      ${e.message.split('\n').join('\n      ')}`)
  }
}
await browser.close()
server?.kill()
const failed = results.filter((r) => !r[0]).length
console.log(`\n${results.length - failed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
