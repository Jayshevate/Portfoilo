/* The blueprint grid floor under the whole route. One plane, one shader. */
import { useMemo } from 'react'
import * as THREE from 'three'
import vert from './shaders/ground.vert'
import frag from './shaders/ground.frag'
import { C } from './kit'

export default function Ground() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        extensions: { derivatives: true },
        uniforms: { uInk: { value: C.ink }, uFadeNear: { value: 8 }, uFadeFar: { value: 38 } },
      }),
    [],
  )
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.6, -100]} material={mat} renderOrder={-1}>
      <planeGeometry args={[90, 300, 1, 1]} />
    </mesh>
  )
}
