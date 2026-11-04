/*
 * The house easing. One curve used everywhere (Lenis, GSAP, CSS) so the whole
 * site moves with the same "hand": fast out of the blocks, long soft landing.
 * It's an exponential out with a slight lift, tuned by eye.
 */
export const requestEase = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10.5 * t) * (1 - 0.04 * Math.sin(t * Math.PI)))

// Same feel as a CSS cubic-bezier, for transitions in the stylesheet.
export const REQUEST_BEZIER = 'cubic-bezier(0.16, 1, 0.3, 1)'
