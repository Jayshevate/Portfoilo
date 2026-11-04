/*
 * The response. CTA, links, resume and a contact form.
 * The form posts straight to Web3Forms (free, no backend of mine). The key
 * comes from .env.local (VITE_WEB3FORMS_KEY); without one the form says so
 * instead of pretending to send.
 */
import { useState } from 'react'
import { profile, realUrl } from '../../content/profile'
import Magnetic from '../Magnetic'
import Sheet from '../Sheet'
import Stop from '../Stop'
import Txt from '../Txt'

const KEY = import.meta.env.VITE_WEB3FORMS_KEY

function Out({ v, label, href }) {
  const url = realUrl(v)
  if (!url) return <li><span className="out__k">{label}</span> <Txt v={v} /></li>
  return (
    <li>
      <span className="out__k">{label}</span>{' '}
      <Magnetic><a href={href ? href(url) : url} target={href ? undefined : '_blank'} rel="noreferrer">{url.replace(/^https?:\/\//, '')}</a></Magnetic>
    </li>
  )
}

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const resume = realUrl(profile.links.resume)

  async function submit(e) {
    e.preventDefault()
    if (!KEY) return setStatus('nokey')
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, access_key: KEY, subject: 'Portfolio: new message' }),
      })
      const json = await res.json()
      setStatus(json.success ? 'sent' : 'error')
      if (json.success) e.target.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <Stop id="response" className="contact" labelledBy="contact-title">
      <Sheet no={10} title="RESPONSE 200">
        <p className="kicker">HTTP/1.1 200 OK · content-type: human</p>
        <h2 id="contact-title">The request made it back. Your turn.</h2>
        <p className="lede">{profile.contact.cta}</p>
        <div className="contact__grid">
          <div>
            <ul className="out">
              <Out v={profile.links.email} label="mail" href={(u) => `mailto:${u}`} />
              <Out v={profile.links.github} label="github" />
              <Out v={profile.links.linkedin} label="linkedin" />
            </ul>
            {resume ? (
              <Magnetic>
                <a className="btn btn--solid" href={resume} download>download resume (pdf)</a>
              </Magnetic>
            ) : (
              <p className="btn btn--off">resume: <Txt v={profile.links.resume} /></p>
            )}
          </div>
          <form className="form" onSubmit={submit}>
            <label>
              <span>name</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              <span>email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              <span>message</span>
              <textarea name="message" rows={4} required />
            </label>
            {/* Honeypot for bots; humans never see it. */}
            <input type="checkbox" name="botcheck" className="sr-only" tabIndex={-1} aria-hidden="true" />
            <Magnetic>
              <button className="btn btn--solid" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'sending…' : 'send request'}
              </button>
            </Magnetic>
            <p className="form__status" role="status">
              {status === 'sent' && '202 Accepted. I will get back to you.'}
              {status === 'error' && '500. It did not go through. Email works too.'}
              {status === 'nokey' && 'Form not wired yet: add VITE_WEB3FORMS_KEY to .env.local (see README).'}
            </p>
          </form>
        </div>
      </Sheet>
      <footer className="foot">
        <p>Drawn by hand with three.js, React Three Fiber, GSAP and Lenis. No trackers, no cookies.</p>
        <p>Press <kbd>~</kbd> for a terminal.</p>
      </footer>
    </Stop>
  )
}
