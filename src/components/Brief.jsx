/*
 * "Your 60-second brief" — everything a recruiter screens for, on one
 * screen: the fit for each role (with the proof), the logistics, and the
 * three ways to act (email, résumé, copy a summary into their ATS).
 */
import { useState } from 'react'
import { profile, real } from '../content/profile'
import { fit, summary } from '../content/brief'
import Value from './Value'
import PuneClock from './PuneClock'

export default function Brief({ tailor }) {
  const [copy, setCopy] = useState('Copy summary for your ATS')
  const email = real(profile.links.email)
  const resume = real(profile.links.resume)

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary())
      setCopy('Copied: paste it anywhere')
    } catch {
      setCopy('Copy blocked by the browser: select the text in “More info”')
    }
    setTimeout(() => setCopy('Copy summary for your ATS'), 3000)
  }

  // On a tailored link, the role they're hiring for goes first.
  const wanted = tailor?.role
  const roles = wanted ? [...fit].sort((a, b) => (b.role.toLowerCase().includes(wanted) ? 1 : 0) - (a.role.toLowerCase().includes(wanted) ? 1 : 0)) : fit

  const logistics = [
    ['Location', profile.location],
    ['Local time', <PuneClock key="clock" />],
    ['Available', profile.availability],
    ['Work mode', profile.workMode],
    ['Work authorization', profile.workAuthorization],
  ]

  return (
    <section id="brief" aria-labelledby="brief-title" className="px-4 sm:px-10">
      <div className="rounded-md bg-soot p-5 ring-1 ring-line sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-marigold">{tailor?.company ? `For ${tailor.company}` : 'For recruiters'}</p>
            <h2 id="brief-title" className="mt-1 font-display text-4xl font-black uppercase leading-none text-cream sm:text-5xl">
              Your 60-second brief
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {email ? (
              <a href={`mailto:${email}`} className="rounded-sm bg-marigold px-5 py-2.5 font-semibold text-night hover:bg-cream">Email me</a>
            ) : (
              <span className="rounded-sm border border-dashed border-missing/70 px-3 py-2.5 font-mono text-xs text-missing">missing: email</span>
            )}
            {resume && (
              <a href={resume} download className="rounded-sm bg-cream px-5 py-2.5 font-semibold text-night hover:bg-marigold">Résumé (PDF)</a>
            )}
            <button type="button" onClick={copySummary} className="rounded-sm bg-ash px-5 py-2.5 text-cream ring-1 ring-line hover:ring-marigold">
              {copy}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dust">Why me for…</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {roles.map((f) => {
                const match = wanted && f.role.toLowerCase().includes(wanted)
                return (
                <li key={f.role} data-role={f.role} className={`rounded-sm bg-night p-4 ring-1 ${match ? 'ring-2 ring-marigold shadow-[0_0_30px_-8px_rgba(242,162,58,.5)] sm:col-span-2' : 'ring-line'}`}>
                  {match && <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-marigold">The role you're hiring for</p>}
                  <p className="font-display text-2xl font-bold uppercase tracking-wide text-cream">{f.role}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-dust">
                    {f.proof.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden="true" className="text-verified">✓</span>
                        <span>
                          <Value v={p} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dust">Logistics</h3>
            <dl className="mt-3 divide-y divide-line">
              {logistics.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm">
                  <dt className="text-dust">{k}</dt>
                  <dd className="text-cream">
                    <Value v={v} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
