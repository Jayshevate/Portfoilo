/*
 * Top bar: wordmark, section links, search, résumé, and who's watching.
 * "/" focuses search from anywhere (unless you're already typing).
 */
import { useEffect, useRef, useState } from 'react'
import { profile, real } from '../content/profile'
import { VIEWERS } from '../content/catalog'

const LINKS = [
  ['#brief', 'Brief'],
  ['#row-projects', 'Projects'],
  ['#row-credentials', 'Credentials'],
  ['#row-experience', 'Experience'],
  ['#row-stack', 'Stack'],
  ['#credits', 'Contact'],
]

export default function NavBar({ query, onQuery, viewer, onSwitchViewer }) {
  const input = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const resume = real(profile.links.resume)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${scrolled ? 'bg-night/95 shadow-[0_1px_0_#3a3328]' : 'bg-gradient-to-b from-night/90 to-transparent'}`}>
      <div className="flex items-center gap-4 px-4 py-3 sm:gap-8 sm:px-10">
        <a href="#top" className="shrink-0 font-display text-2xl font-black uppercase tracking-[0.12em] text-marigold sm:text-3xl">
          Shevate
          <span className="ml-2 align-middle font-mono text-[10px] font-normal tracking-[0.2em] text-dust">on demand</span>
        </a>

        <nav aria-label="Sections" className="hidden gap-5 text-sm text-dust lg:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="hover:text-cream">
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="relative">
            <span className="sr-only">Search titles</span>
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && onQuery('')}
              placeholder="Search  /"
              className="w-24 rounded-sm border border-line bg-soot px-3 py-1.5 text-sm text-cream placeholder:text-dust focus:w-44 focus:border-marigold focus:outline-none sm:w-44 sm:focus:w-60 motion-safe:transition-all"
            />
          </label>

          {resume ? (
            <a href={resume} download className="hidden rounded-sm bg-marigold px-3 py-1.5 text-sm font-semibold text-night hover:bg-cream sm:block">
              Résumé
            </a>
          ) : (
            <span className="hidden rounded-sm border border-dashed border-missing/70 px-2 py-1.5 font-mono text-[11px] text-missing sm:block" title="Add the PDF path in profile.js">
              missing: résumé
            </span>
          )}

          <button
            type="button"
            onClick={onSwitchViewer}
            className="rounded-sm border border-line px-2.5 py-1.5 text-sm text-dust hover:border-marigold hover:text-cream"
          >
            <span className="sr-only">Watching as </span>
            <span className="hidden sm:inline">{VIEWERS[viewer]?.label ?? 'Who’s here?'}</span>
            <span className="sr-only sm:hidden">{VIEWERS[viewer]?.label ?? 'Who’s here?'}</span>
            <span aria-hidden="true" className="ml-1 text-marigold">⇄</span>
          </button>
        </div>
      </div>
    </header>
  )
}
