/*
 * Navigation helpers that don't force GSAP + Lenis into the first download.
 * The scroll module is imported on demand: in the 3D view it's already
 * loaded by App, in the simple view it only loads if someone clicks a link.
 */
export const loadScroll = () => import('./scroll')

export function scrollToStop(id, at) {
  loadScroll().then((m) => m.scrollToStop(id, at))
}
