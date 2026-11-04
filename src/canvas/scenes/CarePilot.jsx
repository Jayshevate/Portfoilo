/*
 * CarePilot. Hospitals as a node graph; records hop along the edges.
 * Each node is linked to its 2 nearest neighbours. A record picks a random
 * neighbour when it arrives somewhere, and the node it lands on pulses.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mats, ringGeo, rng, segmentsGeo } from '../kit'
import { quality } from '../../core/quality'

const NODES = 14
const RECORDS = quality.tier === 'low' ? 6 : 12

function buildGraph() {
  const r = rng(42)
  const nodes = []
  for (let i = 0; i < NODES; i++) {
    const a = r() * Math.PI * 2
    const d = 1.2 + r() * 4.2
    nodes.push(new THREE.Vector3(Math.cos(a) * d, (r() - 0.5) * 1.2, Math.sin(a) * d))
  }
  const adj = nodes.map(() => new Set())
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => [j, n.distanceTo(m)])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .forEach(([j]) => {
        adj[i].add(j)
        adj[j].add(i)
      })
  })
  const pairs = []
  adj.forEach((s, i) => s.forEach((j) => j > i && pairs.push([nodes[i].toArray(), nodes[j].toArray()])))
  return { nodes, adj: adj.map((s) => [...s]), edges: segmentsGeo(pairs) }
}

export default function CarePilot({ position }) {
  const graph = useMemo(buildGraph, [])
  const ring = useMemo(() => ringGeo(0.32, 32), [])
  const oct = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.16, 0)), [])
  const ringRefs = useRef([])
  const hits = useRef(new Array(NODES).fill(-10))
  const dots = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const r = useMemo(() => rng(7), [])
  // Each record: from node, to node, progress, speed
  const recs = useMemo(
    () =>
      Array.from({ length: RECORDS }, (_, i) => {
        const from = i % NODES
        return { from, to: graph.adj[from][0], k: r(), speed: 0.5 + r() * 0.6 }
      }),
    [graph, r],
  )

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    recs.forEach((rec, i) => {
      rec.k += dt * rec.speed
      if (rec.k >= 1) {
        hits.current[rec.to] = t
        rec.from = rec.to
        const opts = graph.adj[rec.from]
        rec.to = opts[Math.floor(r() * opts.length)]
        rec.k = 0
      }
      const a = graph.nodes[rec.from]
      const b = graph.nodes[rec.to]
      // A small arc: records "hop" rather than slide.
      dummy.position.lerpVectors(a, b, rec.k)
      dummy.position.y += Math.sin(rec.k * Math.PI) * 0.6
      dummy.scale.setScalar(0.07)
      dummy.updateMatrix()
      dots.current.setMatrixAt(i, dummy.matrix)
    })
    dots.current.instanceMatrix.needsUpdate = true
    ringRefs.current.forEach((el, i) => {
      if (!el) return
      const p = Math.exp(-(t - hits.current[i]) * 3)
      el.scale.setScalar(1 + p * 0.9)
      el.material = p > 0.2 ? mats.accent : mats.faded
    })
  })

  return (
    <group position={position}>
      <lineSegments geometry={graph.edges} material={mats.faded} />
      {graph.nodes.map((n, i) => (
        <group key={i} position={n}>
          <lineSegments geometry={oct} material={mats.ink} />
          <lineLoop ref={(el) => (ringRefs.current[i] = el)} geometry={ring} material={mats.faded} />
        </group>
      ))}
      <instancedMesh ref={dots} args={[undefined, undefined, RECORDS]} material={mats.dotAccent}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </group>
  )
}
