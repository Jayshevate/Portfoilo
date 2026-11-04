/*
 * Decide once, at startup, how much this device can handle.
 * The 3D scenes read `quality.tier` to drop detail; nothing here is fancy,
 * it just avoids melting a phone.
 */
function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function detect() {
  const mq = (q) => window.matchMedia(q).matches
  const coarse = mq('(pointer: coarse)')
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 8

  let tier = 'high'
  if (cores <= 4 || mem <= 4) tier = 'mid'
  if ((coarse && small) || cores <= 2 || mem <= 2) tier = 'low'

  return {
    tier,
    mobile: coarse && small,
    // DPR cap: retina at 2x would quadruple the fragment work for little gain.
    dpr: tier === 'low' ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
    particles: tier === 'low' ? 3500 : tier === 'mid' ? 7000 : 11000,
    finePointer: mq('(pointer: fine)'),
    reducedMotion: mq('(prefers-reduced-motion: reduce)'),
    webgl: hasWebGL(),
  }
}

export const quality = typeof window !== 'undefined' ? detect() : { tier: 'low', webgl: false }
