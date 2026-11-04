// The request packet + the security scan.
// uScan is the height (-1..1, in packet radii) of the scanning band. Outside
// the gate it is parked at 3.0, i.e. off the object.
uniform float uTime;
uniform float uScan;
uniform float uVerified;   // 0..1, flashes ink-white when a gate accepts it
uniform float uOpacity;
uniform vec3 uAccent;
uniform vec3 uInk;
uniform vec3 uPaper;

varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vView;

void main() {
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
  vec3 col = mix(uAccent, uInk, fres * 0.85);

  // Scan band: a bright line plus "readout" stripes just behind it.
  float y = vObj.y;
  float band = smoothstep(0.12, 0.0, abs(y - uScan));
  float scanning = step(abs(uScan), 1.2);
  float trail = step(y, uScan) * smoothstep(0.6, 0.0, uScan - y) * scanning;
  float stripes = step(0.5, fract(y * 18.0 - uTime * 2.0)) * trail * 0.35;
  col = mix(col, uInk, clamp(band + stripes, 0.0, 1.0));

  col = mix(col, uInk, uVerified * 0.8);
  gl_FragColor = vec4(col, uOpacity * (0.75 + 0.25 * fres));
}
