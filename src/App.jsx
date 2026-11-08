/*
 * App — the whole site is one page: billboard, rows, credits. Overlays on
 * top of it: the "Who's here?" gate, a title page, the trailer.
 *
 * State, all local to this visitor:
 *   viewer   who's watching (orders the rows)      → localStorage
 *   saved    My List                               → localStorage
 *   recent   titles opened, newest first           → localStorage
 *   query    search box
 *   open     the title in the URL hash (#title=id), so links are shareable
 *
 * The first render must match the pre-rendered HTML exactly, so anything
 * read from the browser (storage, hash) is loaded in an effect afterwards.
 */
import { useCallback, useEffect, useState } from 'react'
import { ROWS, VIEWERS, DEFAULT_VIEWER, titleById, search } from './content/catalog'
import { read, write } from './lib/storage'
import { parseHash, setTitleHash, useTitleHash } from './lib/hash'
import NavBar from './components/NavBar'
import Billboard from './components/Billboard'
import Row from './components/Row'
import Gate from './components/Gate'
import TitlePage from './components/TitlePage'
import Trailer from './components/Trailer'
import Credits from './components/Credits'
import TitleCard from './components/TitleCard'

const MAX_RECENT = 8

export default function App() {
  const [ready, setReady] = useState(false) // true once browser state is loaded
  const [viewer, setViewer] = useState(null)
  // Open in the pre-rendered HTML; CSS hides it before paint for returning visitors.
  const [gate, setGate] = useState(true)
  const [saved, setSaved] = useState([])
  const [recent, setRecent] = useState([])
  const [query, setQuery] = useState('')
  const [trailer, setTrailer] = useState(false)
  const openId = useTitleHash()
  const open = openId ? titleById[openId] : null

  useEffect(() => {
    const v = read('viewer', null)
    setViewer(VIEWERS[v] ? v : null)
    // Someone who followed a shared link (#title=...) goes straight to it.
    setGate(!VIEWERS[v] && !parseHash(window.location.hash))
    document.documentElement.classList.add('hydrated')
    setSaved(read('saved', []).filter((id) => titleById[id]))
    setRecent(read('recent', []).filter((id) => titleById[id]))
    setReady(true)
  }, [])

  // Remember what this visitor opened (for "Continue watching").
  useEffect(() => {
    if (!open) return
    setRecent((r) => {
      const next = [open.id, ...r.filter((x) => x !== open.id)].slice(0, MAX_RECENT)
      write('recent', next)
      return next
    })
  }, [open])

  const pickViewer = (v) => {
    setViewer(v)
    write('viewer', v)
    setGate(false)
    window.scrollTo(0, 0)
    // The button just clicked disappears with the gate; drop focus so the
    // next Tab starts from there (the gate is first in the DOM).
    document.activeElement?.blur()
  }

  const toggleSave = (id) =>
    setSaved((s) => {
      const next = s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]
      write('saved', next)
      return next
    })

  const openTitle = useCallback((id) => setTitleHash(id), [])
  const closeTitle = useCallback(() => setTitleHash(null), [])
  const closeTrailer = useCallback(() => setTrailer(false), [])
  const toContact = useCallback(() => {
    setTrailer(false)
    document.getElementById('credits')?.scrollIntoView()
  }, [])

  const rows = VIEWERS[viewer ?? DEFAULT_VIEWER].rows
  const results = query.trim() ? search(query) : null
  const overlay = (ready && gate) || open || trailer
  const list = (ids) => ids.map((id) => titleById[id]).filter(Boolean)

  return (
    <>
      {/* Gate first in the DOM: after it closes, the next Tab lands on the skip link. */}
      <Gate open={gate} onPick={pickViewer} />

      <a href="#rows" className="fixed left-3 top-3 z-[60] -translate-y-24 rounded-sm bg-marigold px-3 py-2 font-semibold text-night focus:translate-y-0">
        Skip to the catalogue
      </a>

      <div inert={overlay ? '' : undefined} aria-hidden={overlay ? true : undefined}>
        <NavBar query={query} onQuery={setQuery} viewer={viewer} onSwitchViewer={() => setGate(true)} />

        <main>
          {!results && <Billboard onPlay={() => setTrailer(true)} onInfo={() => openTitle('about')} />}

          <div id="rows" className={`relative z-10 space-y-8 sm:space-y-12 ${results ? 'pt-24' : 'pt-10'}`}>
            {results ? (
              <section aria-labelledby="results" className="px-4 sm:px-10">
                <h2 id="results" className="font-display text-3xl font-bold uppercase tracking-wide text-cream">
                  {results.length ? `Results for “${query.trim()}”` : `Nothing matches “${query.trim()}”`}
                </h2>
                {!results.length && <p className="mt-2 text-dust">Try “aws”, “iot”, “healthcare” or “intern”.</p>}
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {results.map((t) => (
                    <li key={t.id}>
                      <TitleCard title={t} onOpen={openTitle} saved={saved.includes(t.id)} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <>
                {ready && <Row id="mylist" name="My list" note="saved in your browser only" titles={list(saved)} onOpen={openTitle} savedIds={saved} />}
                {ready && <Row id="recent" name="Continue watching" titles={list(recent)} onOpen={openTitle} savedIds={saved} />}
                {rows.map((key) => (
                  <Row key={key} id={key} name={ROWS[key].name} numbered={key === 'projects'} note={key === 'projects' ? 'now showing' : undefined} titles={list(ROWS[key].ids)} onOpen={openTitle} savedIds={saved} />
                ))}
              </>
            )}
          </div>
        </main>

        <Credits />
      </div>

      {open && <TitlePage key={open.id} title={open} onClose={closeTitle} onOpen={openTitle} saved={saved.includes(open.id)} onToggleSave={toggleSave} />}
      {trailer && <Trailer onClose={closeTrailer} onContact={toContact} />}
    </>
  )
}
