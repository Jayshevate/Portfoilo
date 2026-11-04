uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uOpacity;

varying float vAccent;
varying float vAlpha;

void main() {
  // Round, slightly soft dot (ink on paper, so plain alpha blending). Discarding the corners is cheaper than blending them.
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.2, d);
  gl_FragColor = vec4(mix(uInk, uAccent, vAccent), a * vAlpha * uOpacity);
}
