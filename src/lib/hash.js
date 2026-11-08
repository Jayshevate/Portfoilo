/*
 * The only "routing" the site needs: #title=<id> opens a title, so a
 * recruiter can paste a link to one project. Everything else is one page.
 */
import { useEffect, useState } from 'react'

export const parseHash = (hash) => new URLSearchParams(hash.replace(/^#/, '')).get('title')

export function setTitleHash(id) {
  const url = id ? `#title=${encodeURIComponent(id)}` : window.location.pathname + window.location.search
  // replaceState for close, pushState for open, so Back closes the title.
  if (id) window.history.pushState(null, '', url)
  else window.history.replaceState(null, '', url)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function useTitleHash() {
  const [id, setId] = useState(null) // null on the server and first client render
  useEffect(() => {
    const sync = () => setId(parseHash(window.location.hash))
    sync()
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])
  return id
}
