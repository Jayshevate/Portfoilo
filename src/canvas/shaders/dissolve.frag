// The locked membrane inside each security gate.
// Drawn as blueprint hatching (diagonal lines). When a certification checks
// out, uDissolve goes 0→1 and noise decides which pixels burn away first;
// a thin ink-white rim glows along the burning edge.
#include "./noise.glsl"

uniform float uTime;
uniform float uDissolve;
uniform vec3 uAccent;
uniform vec3 uInk;
uniform vec2 uAspect;

varying vec2 vUv;

void main() {
  vec2 p = vUv * uAspect;
  float n = snoise(vec3(p * 1.6, 0.0)) * 0.5 + 0.5;
  n = n * 0.75 + 0.25 * (snoise(vec3(p * 6.0, 3.0)) * 0.5 + 0.5);

  float cut = uDissolve * 1.15 - 0.05;
  if (n < cut) discard;

  // 45° hatching, the way a section cut is drawn on a blueprint.
  float hatch = smoothstep(0.42, 0.5, abs(fract((p.x + p.y) * 9.0) - 0.5));
  // A slow scanline sweeping while locked.
  float sweep = smoothstep(0.02, 0.0, abs(fract(vUv.y - uTime * 0.25) - 0.5)) * (1.0 - uDissolve);

  float edge = smoothstep(cut + 0.06, cut, n) * step(0.001, uDissolve);
  vec3 col = mix(uAccent, uInk, max(edge, sweep));
  float a = hatch * 0.55 + sweep * 0.5 + edge;
  gl_FragColor = vec4(col, a * (1.0 - uDissolve * 0.3));
}
