/*
 * The page a title opens into (a modal over the catalogue): banner, the
 * facts, "episodes" (problem → architecture → stack → my part), links,
 * and "More like this". It's a proper dialog: focus moves in, Tab stays
 * inside, Esc or Back closes it, focus returns to the card you came from.
 */
import { useEffect, useRef, useState } from 'react'
import { isFill, real } from '../content/profile'
import { similar } from '../content/catalog'
import Art from './Art'
import Value from './Value'
import TitleCard from './TitleCard'

const LABEL = { project: 'Project', credential: 'Credential', experience: 'Experience', skill: 'Stack', about: 'About' }

function useFocusTrap(ref, onClose) {
  useEffect(() => {
    const back = document.activeElement
    const el = ref.current
    el?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !el) return
      const f = el.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex="0"]')
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      back?.focus?.()
    }
  }, [ref, onClose])
}

function LinkOut({ label, value }) {
  const url = real(value)
  if (url && /^(https?:|\/)/.test(url))
    return (
      <a href={url} target="_blank" rel="noreferrer" className="rounded-sm bg-cream px-4 py-2 text-sm font-semibold text-night hover:bg-marigold">
        {label} ↗
      </a>
    )
  return (
    <span className="rounded-sm border border-line px-4 py-2 text-sm text-dust">
      {label}: <Value v={value} />
    </span>
  )
}

export default function TitlePage({ title, onClose, onOpen, saved, onToggleSave }) {
  const box = useRef(null)
  const [copy, setCopy] = useState('Copy link') // button label doubles as feedback
  useFocusTrap(box, onClose)

  // Lock the page behind the dialog.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopy('Link copied')
    } catch {
      // Clipboard blocked (insecure origin or permissions): the URL bar has it.
      setCopy('Copy the URL from the address bar')
    }
    setTimeout(() => setCopy('Copy link'), 2500)
  }

  const more = similar(title.id)

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-night/80 sm:py-10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="title-name"
        className="relative mx-auto min-h-full w-full max-w-4xl bg-soot outline-none ring-1 ring-line motion-safe:animate-rise sm:min-h-0 sm:rounded-md"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-night/80 text-xl text-cream ring-1 ring-line hover:ring-marigold">
          ✕
        </button>

        <div className="relative">
          <Art title={title} className="block aspect-[16/7] w-full sm:rounded-t-md" />
          <div className="absolute bottom-0 left-0 p-5 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-marigold">{LABEL[title.kind]}</p>
            <h2 id="title-name" className="font-display text-4xl font-black uppercase leading-none text-cream sm:text-6xl">
              {title.name}
            </h2>
          </div>
        </div>

        <div className="grid gap-8 p-5 sm:grid-cols-[1.6fr_1fr] sm:p-8">
          <div>
            {title.tags.length > 0 && (
              <p className="mb-3 flex flex-wrap gap-2 font-mono text-xs text-dust">
                {title.tags.map((t) => (
                  <span key={t} className="rounded-sm border border-line px-1.5 py-0.5">{t}</span>
                ))}
              </p>
            )}
            <p className="text-lg leading-relaxed text-cream">{title.logline}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {title.kind !== 'about' && (
                <button type="button" onClick={() => onToggleSave(title.id)} aria-pressed={saved} className="rounded-sm bg-ash px-4 py-2 text-sm text-cream ring-1 ring-line hover:ring-marigold">
                  {saved ? '✓ On my list' : '+ My list'}
                </button>
              )}
              <button type="button" onClick={share} className="rounded-sm bg-ash px-4 py-2 text-sm text-cream ring-1 ring-line hover:ring-marigold">
                {copy}
              </button>
              {title.links.map((l) => (
                <LinkOut key={l.label} {...l} />
              ))}
            </div>
          </div>

          {title.facts.length > 0 && (
            <dl className="grid content-start gap-3 text-sm">
              {title.facts.map((f) => (
                <div key={f.label}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-dust">{f.label}</dt>
                  <dd className={isFill(f.value) ? '' : 'text-cream'}>
                    <Value v={f.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {title.episodes.length > 0 && (
          <section aria-labelledby="eps" className="border-t border-line p-5 sm:p-8">
            <h3 id="eps" className="font-display text-2xl font-bold uppercase tracking-wide text-cream">Episodes</h3>
            <ol className="mt-4 divide-y divide-line">
              {title.episodes.map((ep, i) => (
                <li key={ep.name} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4 sm:grid-cols-[3.5rem_1fr]">
                  <span className="font-display text-3xl font-black text-dust sm:text-4xl">{i + 1}</span>
                  <div>
                    <h4 className="font-semibold text-cream">{ep.name}</h4>
                    <p className="mt-1 text-dust">
                      <Value v={ep.body} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {title.screenshots.length > 0 && (
          <section aria-label="Screenshots" className="border-t border-line p-5 sm:p-8">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {title.screenshots.map((s) => (
                <li key={s.src}>
                  <img src={s.src} alt={s.alt} loading="lazy" decoding="async" className="aspect-video w-full rounded-sm object-cover ring-1 ring-line" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {more.length > 0 && (
          <section aria-labelledby="more" className="border-t border-line p-5 sm:p-8">
            <h3 id="more" className="font-display text-2xl font-bold uppercase tracking-wide text-cream">More like this</h3>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {more.map((t) => (
                <li key={t.id}>
                  <TitleCard title={t} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  )
}
