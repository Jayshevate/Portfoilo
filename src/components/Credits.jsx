/*
 * End credits = the contact section. Links, résumé, a form, then the
 * credits roll, which is just the facts about me set like film credits.
 *
 * The form posts to Web3Forms (free, no server of mine). The key comes from
 * .env.local as VITE_WEB3FORMS_KEY. Without a key the form says so instead
 * of pretending to send. Each visitor's submission is independent: there
 * is no shared state, so many people can use it at the same time.
 */
import { useState } from 'react'
import { profile, real } from '../content/profile'
import Value from './Value'
import PuneClock from './PuneClock'

const KEY = import.meta.env.VITE_WEB3FORMS_KEY

function Contact({ label, value, href }) {
  const url = real(value)
  return (
    <li className="flex items-baseline gap-4 border-b border-line py-3">
      <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-dust">{label}</span>
      {url ? (
        <a href={href ? href(url) : url} target={href ? undefined : '_blank'} rel="noreferrer" className="break-all text-cream underline decoration-marigold/60 underline-offset-4 hover:text-marigold">
          {url.replace(/^(https?:\/\/|mailto:)/, '')}
        </a>
      ) : (
        <Value v={value} />
      )}
    </li>
  )
}

export function ContactForm() {
  const [status, setStatus] = useState('idle')

  async function submit(e) {
    e.preventDefault()
    if (!KEY) return setStatus('nokey')
    const form = e.currentTarget
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), access_key: KEY, subject: 'Portfolio: new message' }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        setStatus('sent')
        form.reset()
      } else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const field = 'mt-1 w-full rounded-sm border border-line bg-night px-3 py-2 text-cream placeholder:text-dust focus:border-marigold focus:outline-none'
  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="text-sm text-dust">
        Name
        <input name="name" required autoComplete="name" maxLength={120} className={field} />
      </label>
      <label className="text-sm text-dust">
        Email
        <input name="email" type="email" required autoComplete="email" maxLength={200} className={field} />
      </label>
      <label className="text-sm text-dust">
        Message
        <textarea name="message" required rows={4} maxLength={4000} className={field} />
      </label>
      {/* Honeypot: bots fill it, people never see it. */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />
      <div className="flex items-center gap-4">
        <button type="submit" disabled={status === 'sending'} className="rounded-sm bg-marigold px-6 py-2.5 font-semibold text-night hover:bg-cream disabled:opacity-60">
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
        <p role="status" className="text-sm">
          {status === 'sent' && <span className="text-verified">Sent. I'll reply to the email you gave.</span>}
          {status === 'error' && <span className="text-missing">That didn't go through. Try again, or email me directly.</span>}
          {status === 'nokey' && <span className="text-missing">The form isn't connected yet (missing VITE_WEB3FORMS_KEY).</span>}
        </p>
      </div>
    </form>
  )
}

export default function Credits() {
  const resume = real(profile.links.resume)
  const credits = [
    ['Written, directed and engineered by', profile.name],
    ['Currently', profile.role],
    ['Education', `${profile.education.degree}, ${profile.education.school}, ${profile.education.year}`],
    ['Filmed on location in', profile.location],
    ['Languages', profile.spoken.join(', ')],
    ['In production', `Learning ${profile.learning.join(', ')}`],
  ]

  return (
    <footer id="credits" className="mt-16 border-t border-line px-4 pb-16 pt-14 sm:px-10">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-5xl font-black uppercase leading-none text-cream sm:text-7xl">Roll credits</h2>
          <p className="mt-4 max-w-lg text-lg text-cream/90">{profile.cta}</p>
          <p className="mt-2 text-sm text-dust">It's <PuneClock /> in {profile.city} right now.</p>
          <ul className="mt-6 max-w-lg">
            <Contact label="Email" value={profile.links.email} href={(u) => `mailto:${u}`} />
            <Contact label="GitHub" value={profile.links.github} />
            <Contact label="LinkedIn" value={profile.links.linkedin} />
          </ul>
          <div className="mt-6">
            {resume ? (
              <a href={resume} download className="inline-block rounded-sm bg-cream px-6 py-2.5 font-semibold text-night hover:bg-marigold">Download résumé (PDF)</a>
            ) : (
              <p className="text-sm text-dust">Résumé: <Value v={profile.links.resume} /></p>
            )}
          </div>
        </div>
        <ContactForm />
      </div>

      <dl className="mx-auto mt-20 max-w-xl space-y-5 text-center">
        {credits.map(([role, who]) => (
          <div key={role}>
            <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-dust">{role}</dt>
            <dd className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-cream">{who}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-16 text-center font-mono text-xs text-dust">
        Built with React, Tailwind and Vite. No trackers, no cookies. Your list and history stay in your own browser.
      </p>
    </footer>
  )
}
