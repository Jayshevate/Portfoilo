/*
 * kit.js — the drawing set for the whole world.
 *
 * The art direction is a field notebook: every object is drawn in blue
 * ballpoint and pencil on manila paper, so almost everything is LineSegments with one of three
 * shared materials. Sharing materials means three.js compiles 3 programs,
 * not 300, and the look stays consistent by construction.
 */
import * as THREE from 'three'

export const PALETTE = {
  paper: '#ece3d0',  // manila
  ink: '#2a44a8',    // blue ballpoint (in 3D the "ink" is the pen)
  faded: '#8f8676',  // pencil
  accent: '#c8372d', // red pen
}

export const C = {
  paper: new THREE.Color(PALETTE.paper),
  ink: new THREE.Color(PALETTE.ink),
  faded: new THREE.Color(PALETTE.faded),
  accent: new THREE.Color(PALETTE.accent),
}

/*
 * Line boil. Hand-drawn animation never holds a line perfectly still: each
 * drawing is re-traced, so it shimmers slightly. We fake that in the vertex
 * shader: every vertex gets a tiny random offset that changes 8 times a
 * second (not every frame; the stepping is what makes it read as "drawn").
 * The offset is hashed from the vertex position, so two segments that share
 * a corner jitter together and never come apart.
 */
export const boil = { value: 0 }       // time, stepped; written by <Boil/> in Experience
export const boilAmp = { value: 0.016 } // world units; 0 for reduced motion

function boilify(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBoil = boil
    shader.uniforms.uBoilAmp = boilAmp
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uBoil;
        uniform float uBoilAmp;
        vec3 boilHash(vec3 p) {
          p = fract(p * vec3(0.1031, 0.1030, 0.0973));
          p += dot(p, p.yxz + 33.33);
          return fract((p.xxy + p.yxx) * p.zyx) - 0.5;
        }`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed += boilHash(position * 7.13 + uBoil * 1.7) * uBoilAmp;`,
      )
  }
  mat.customProgramCacheKey = () => 'boil'
  return mat
}

/** A boiling line material. Use this instead of `new LineBasicMaterial`. */
export const lineMat = (color, opacity = 1) =>
  boilify(new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }))

/** Copy of a shared line material (when one object needs its own colour). */
export const cloneLine = (m) => lineMat(m.color.clone(), m.opacity)

export const mats = {
  ink: lineMat(C.ink, 0.9),
  faded: lineMat(C.faded, 0.75),
  accent: lineMat(C.accent),
  dotAccent: new THREE.MeshBasicMaterial({ color: C.accent }),
  dotInk: new THREE.MeshBasicMaterial({ color: C.ink }),
}

/** Wireframe edges of a box, as reusable geometry. */
export const boxEdges = (w, h, d) => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d))

/** A circle outline in the XZ plane (a "plan view" ring). */
export function ringGeo(r, seg = 48) {
  const pts = []
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

/** Geometry for LineSegments from pairs of points [[a,b],[a,b]...]. */
export function segmentsGeo(pairs) {
  const arr = new Float32Array(pairs.length * 6)
  pairs.forEach(([a, b], i) => arr.set([...a, ...b], i * 6))
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  return g
}

/** Merge many EdgesGeometry boxes into one LineSegments geometry (one draw call). */
export function mergeBoxes(boxes) {
  const parts = boxes.map(({ size, pos }) => {
    const g = boxEdges(...size)
    g.translate(...pos)
    return g.attributes.position.array
  })
  const total = parts.reduce((n, a) => n + a.length, 0)
  const arr = new Float32Array(total)
  let o = 0
  parts.forEach((a) => {
    arr.set(a, o)
    o += a.length
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  return g
}

/** Deterministic random, so the world is the same on every visit. */
export function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt))
