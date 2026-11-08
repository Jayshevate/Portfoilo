/*
 * localStorage that never throws. Private windows, blocked cookies and
 * full storage all make the real API throw; the site must still work, it
 * just won't remember anything. Only per-visitor conveniences live here:
 * who's watching, My List, recently opened.
 */
const KEY = 'jcs:'

export function read(name, fallback) {
  try {
    const raw = window.localStorage.getItem(KEY + name)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function write(name, value) {
  try {
    window.localStorage.setItem(KEY + name, JSON.stringify(value))
  } catch {
    /* storage unavailable: forget silently */
  }
}
