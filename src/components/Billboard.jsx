/*
 * The billboard: who I am in one screen, with the two things a recruiter
 * checks first (strongest credential, what I'm looking for) and two buttons.
 * Behind it, the five project posters drift past on a slow loop.
 */
import { profile } from '../content/profile'
import { titles } from '../content/catalog'
import Art from './Art'

const projects = titles.filter((t) => t.kind === 'project')
const ccp = profile.credentials[0]

export default function Billboard({ onPlay, onInfo }) {
  return (
    <section id="top" aria-labelledby="bill-title" className="relative isolate flex min-h-[86svh] items-end overflow-hidden pb-14 pt-28 sm:min-h-[92svh] sm:pb-24">
      {/* Poster wall: two copies side by side so the loop has no seam. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60 [perspective:900px]">
        <div className="absolute -inset-x-20 top-6 flex w-max motion-safe:animate-drift [transform:rotateX(14deg)_rotateZ(-4deg)]">
          {[0, 1].map((copy) => (
            <div key={copy} className="grid grid-flow-col grid-rows-2 gap-3 pr-3">
              {[...projects, ...projects].map((t, i) => (
                <Art key={`${copy}-${i}`} title={t} className="h-[30vh] w-auto rounded-md" />
              ))}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/40" />
      </div>

      <div className="max-w-3xl px-4 sm:px-10">
        <p className="motion-safe:animate-rise font-mono text-xs uppercase tracking-[0.25em] text-marigold">
          A one-person catalogue · {profile.city}
        </p>
        <h1 id="bill-title" className="mt-3 font-display text-6xl font-black uppercase leading-[0.85] tracking-tight text-cream motion-safe:animate-rise sm:text-8xl lg:text-9xl">
          {profile.displayName}
        </h1>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-dust sm:text-sm">
          <span className="rounded-sm border border-verified/60 px-1.5 py-0.5 text-verified">{ccp.name.replace('AWS Certified ', 'AWS ')} · {ccp.result}</span>
          <span>{profile.education.degree.replace('Computer Science & Engineering', 'CSE')}</span>
          <span>· {profile.education.year}</span>
        </p>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/90 sm:text-xl">{profile.tagline}</p>

        <p className="mt-3 text-sm text-dust">
          Looking for {profile.targeting.slice(0, -1).join(', ')} or {profile.targeting.at(-1)} roles
          {profile.freelance ? ', and open to freelance work.' : '.'}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={onPlay} className="flex items-center gap-2 rounded-sm bg-cream px-6 py-2.5 font-semibold text-night hover:bg-marigold">
            <span aria-hidden="true">▶</span> Play trailer
          </button>
          <button type="button" onClick={onInfo} className="flex items-center gap-2 rounded-sm bg-ash/90 px-6 py-2.5 font-semibold text-cream ring-1 ring-line hover:bg-ash hover:ring-marigold">
            <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full border border-current text-xs">i</span> More info
          </button>
        </div>
      </div>
    </section>
  )
}
