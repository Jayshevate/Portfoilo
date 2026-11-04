// The drafting-table floor: a minor 1-unit grid and a major 5-unit grid,
// anti-aliased with fwidth() so lines stay one pixel wide at any distance,
// then faded out around the camera so it never reads as a hard horizon.
uniform vec3 uInk;
uniform float uFadeNear;
uniform float uFadeFar;

varying vec3 vWorld;

float gridLine(vec2 p, float size) {
  vec2 g = abs(fract(p / size - 0.5) - 0.5) / fwidth(p / size);
  return 1.0 - min(min(g.x, g.y), 1.0);
}

void main() {
  float minor = gridLine(vWorld.xz, 1.0);
  float major = gridLine(vWorld.xz, 5.0);
  float d = distance(vWorld.xz, cameraPosition.xz);
  float fade = 1.0 - smoothstep(uFadeNear, uFadeFar, d);
  float a = (minor * 0.06 + major * 0.14) * fade;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uInk, a);
}
