// Hero / response particles.
// Every particle carries three positions and the shader blends between them:
//   aScatter → aText   (uIntro 0→1, time-based, the name assembling)
//   aText    → packet  (uMorph 0→1, scroll-based, the name becoming the packet)
// All of this runs on the GPU, so 11k particles cost one draw call.
#include "./noise.glsl"

uniform float uTime;
uniform float uIntro;
uniform float uMorph;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uPacket;      // live world position of the packet
uniform float uPacketRadius;
uniform float uInvScale;   // 1 / group scale: keeps noise sizes in world units

attribute vec3 aText;
attribute vec3 aScatter;
attribute vec3 aSphere;    // unit-sphere point: where on the packet this one lands
attribute float aRand;

varying float vAccent;
varying float vAlpha;

void main() {
  // Each particle starts at a slightly different moment → the name "writes" itself.
  float intro = smoothstep(aRand * 0.45, aRand * 0.45 + 0.55, uIntro);
  intro = 1.0 - pow(1.0 - intro, 3.0);
  vec3 p = mix(aScatter, aText, intro);

  // Breathing while the name holds still, so it never looks like a static image.
  p += 0.025 * uInvScale * flow(p / uInvScale * 0.6 + uTime * 0.15) * intro;

  // Collapse into the packet. Stagger by aRand again, and push particles
  // through a noise field in the middle of the trip (peaks at m = 0.5).
  float m = smoothstep(aRand * 0.35, aRand * 0.35 + 0.65, uMorph);
  float swirl = sin(m * 3.14159);
  vec3 target = uPacket + aSphere * uPacketRadius;
  p = mix(p, target, m * m * (3.0 - 2.0 * m));
  p += flow(p / uInvScale * 0.35 + uTime * 0.2) * swirl * 1.6 * uInvScale;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // Size attenuation by distance; particles shrink as they join the packet.
  gl_PointSize = uSize * uPixelRatio * (0.6 + aRand * 0.8) * (1.0 - 0.55 * m) / -mv.z;

  vAccent = step(0.94, aRand);      // ~6% are vermilion, like stray ink marks
  vAlpha = mix(0.25, 1.0, intro) * (1.0 - smoothstep(0.92, 1.0, uMorph));
}
