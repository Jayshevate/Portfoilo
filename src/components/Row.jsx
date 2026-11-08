/*
 * A horizontal row of titles. Native horizontal scrolling (touch, trackpad,
 * Shift+wheel all work for free); the arrow buttons just scroll by one
 * screen. The list is a real <ul> under a heading, so it reads properly
 * without any of the visuals.
 */
import { useRef } from 'react'
import TitleCard from './TitleCard'

export default function Row({ id, name, titles, onOpen, savedIds = [], note, numbered = false }) {
  const track = useRef(null)
  const page = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: 'smooth' })

  if (!titles.length) return null
  return (
    <section aria-labelledby={`row-${id}`} className="group/row relative">
      <div className="mb-2 flex items-baseline gap-3 px-4 sm:px-10">
        <h2 id={`row-${id}`} className="font-display text-2xl font-bold uppercase tracking-wide text-cream sm:text-3xl">
          {name}
        </h2>
        {note && <p className="font-mono text-xs text-dust">{note}</p>}
      </div>

      <ul
        ref={track}
        className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 sm:scroll-px-10 pb-4 pt-2 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {titles.map((t, i) => (
          <li key={t.id} className={`flex shrink-0 snap-start items-end ${numbered ? 'w-[86vw] sm:w-[52vw] md:w-[38vw] lg:w-[28vw] xl:w-[24vw]' : 'w-[72vw] sm:w-[42vw] md:w-[30vw] lg:w-[22vw] xl:w-[19vw]'}`}>
            {numbered && (
              // Outlined numerals, just a running order, not a ranking.
              <span aria-hidden="true" className="-mr-3 select-none font-display text-[7rem] font-black leading-[0.75] text-transparent [-webkit-text-stroke:2px_#f2a23a] sm:text-[9rem]">
                {i + 1}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <TitleCard title={t} onOpen={onOpen} saved={savedIds.includes(t.id)} />
            </div>
          </li>
        ))}
      </ul>

      {/* Paging arrows: desktop only, keyboard users have Tab. */}
      {['left', 'right'].map((side) => (
        <button
          key={side}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => page(side === 'left' ? -1 : 1)}
          className={`absolute top-10 bottom-4 hidden w-10 items-center justify-center bg-night/70 text-3xl text-cream opacity-0 transition group-hover/row:opacity-100 sm:flex ${side === 'left' ? 'left-0' : 'right-0'}`}
        >
          {side === 'left' ? '‹' : '›'}
        </button>
      ))}
    </section>
  )
}
