/*
 * The ~ terminal. A tiny command parser over profile.js:
 * each command is a function returning lines of output. `open` and
 * `contact` also move the camera. Up/Down walks history, Tab completes
 * project names, Esc closes. Output is an aria-live log for screen readers.
 */
import { useEffect, useRef, useState } from 'react'
import { profile, plain } from '../content/profile'
import { useStore } from '../core/store'
import { scrollToStop } from '../core/scroll'

const slugs = profile.projects.map((p) => p.slug)

const COMMANDS = {
  help: () => [
    'whoami            who is on the other end',
    'ls projects       list services',
    'open <project>    fly to a project (tab completes)',
    'certs             credentials',
    'contact           how to reach me',
    'resume            where the PDF is',
    'simple            switch to the simple view',
    'sound on|off      ambient hum',
    'clear · exit',
  ],
  whoami: () => [
    profile.name,
    `${profile.role} · ${profile.location}`,
    `${profile.education.degree}, ${profile.education.year}`,
    `looking for: ${profile.targeting.join(' / ')} roles${profile.freelance ? ' · open to freelance' : ''}`,
  ],
  ls: (arg) =>
    arg === 'projects' || !arg
      ? profile.projects.map((p) => `${p.slug.padEnd(12)} ${p.kind}`)
      : [`ls: ${arg}: no such directory. try: ls projects`],
  open: (arg) => {
    const p = profile.projects.find((x) => x.slug === arg || x.name.toLowerCase() === arg)
    if (!p) return [`open: unknown project "${arg ?? ''}". try: ${slugs.join(', ')}`]
    scrollToStop(p.slug, 0.32)
    return [`routing to ${p.name} …`, `stack: ${plain(p.stack)}`, `role: ${plain(p.role)}`]
  },
  certs: () => profile.certifications.map((c) => `${c.short.padEnd(9)} ${c.score.padEnd(10)} ${c.date}`),
  contact: () => {
    scrollToStop('response', 0)
    return [`mail     ${plain(profile.links.email)}`, `github   ${plain(profile.links.github)}`, `linkedin ${plain(profile.links.linkedin)}`]
  },
  resume: () => [`resume: ${plain(profile.links.resume)}`],
  simple: () => {
    setTimeout(() => useStore.getState().setMode('simple'), 300)
    return ['switching to simple view …']
  },
  sound: (arg) => {
    const on = arg !== 'off'
    import('../core/sound').then((m) => m.setSound(on))
    useStore.getState().setSound(on)
    return [`sound ${on ? 'on' : 'off'}`]
  },
  sudo: () => ['nice try. this incident will be reported (to nobody).'],
}

export default function Terminal() {
  const open = useStore((s) => s.terminal)
  const setOpen = useStore((s) => s.setTerminal)
  const [log, setLog] = useState([{ k: 'out', t: 'type "help". esc to close.' }])
  const [val, setVal] = useState('')
  const hist = useRef([])
  const hi = useRef(0)
  const input = useRef(null)
  const back = useRef(null)
  const end = useRef(null)

  // ~ (or `) toggles from anywhere, except while typing in a form field.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName) && document.activeElement !== input.current
      if ((e.key === '`' || e.key === '~') && !typing) {
        e.preventDefault()
        setOpen(!useStore.getState().terminal)
      }
      if (e.key === 'Escape' && useStore.getState().terminal) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      back.current = document.activeElement
      setTimeout(() => input.current?.focus(), 30)
    } else back.current?.focus?.()
  }, [open])

  // Braces matter: newer Chrome returns a Promise from scrollIntoView, and an
  // effect must return a cleanup function or nothing.
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [log])

  const run = (line) => {
    const [cmd, ...rest] = line.trim().split(/\s+/)
    const arg = rest.join(' ').toLowerCase() || undefined
    if (!cmd) return
    hist.current.push(line)
    hi.current = hist.current.length
    if (cmd === 'clear') return setLog([])
    if (cmd === 'exit') return setOpen(false)
    const f = COMMANDS[cmd.toLowerCase()]
    const out = f ? f(arg) : [`${cmd}: command not found. type "help".`]
    setLog((l) => [...l, { k: 'in', t: line }, ...out.map((t) => ({ k: 'out', t }))])
    if (cmd === 'open' && f && !out[0].startsWith('open:')) setTimeout(() => setOpen(false), 900)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(val)
      setVal('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      hi.current = Math.max(0, hi.current - 1)
      setVal(hist.current[hi.current] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      hi.current = Math.min(hist.current.length, hi.current + 1)
      setVal(hist.current[hi.current] ?? '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const m = val.match(/^open\s+(\S*)$/)
      if (m) {
        const hit = slugs.find((s) => s.startsWith(m[1]))
        if (hit) setVal(`open ${hit}`)
      } else {
        const hit = Object.keys(COMMANDS).find((c) => c.startsWith(val))
        if (hit) setVal(hit + ' ')
      }
    }
  }

  if (!open) return null
  return (
    <div className="term" role="dialog" aria-modal="true" aria-label="Terminal" data-lenis-prevent onClick={() => input.current?.focus()}>
      <div className="term__bar">
        <span>jcs@edge:~</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close terminal">esc ✕</button>
      </div>
      <div className="term__log" aria-live="polite">
        {log.map((l, i) => (
          <p key={i} className={`term__${l.k}`}>{l.k === 'in' ? `› ${l.t}` : l.t}</p>
        ))}
        <div ref={end} />
      </div>
      <label className="term__line">
        <span aria-hidden="true">›</span>
        <span className="sr-only">Command</span>
        <input
          ref={input}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </label>
    </div>
  )
}
