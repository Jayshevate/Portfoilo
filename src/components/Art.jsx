/*
 * Art — every title's "poster", drawn in SVG from its id. No image files:
 * each project gets a small illustration of what it does, credentials get
 * their result set big like a film title, jobs and skill groups get type.
 *
 * Random-looking details come from a seeded generator, so a poster looks
 * the same on every visit and on the server and the client (no hydration
 * mismatch).
 */
import { useId } from 'react'

const W = 320
const H = 180
const C = { cream: '#f3ede2', dust: '#a89f90', line: '#3a3328', gold: '#f2a23a', teal: '#5cc2b3', ash: '#262119' }

function rng(seed) {
  let s = 0
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/* --- one motif per project --- */

function Pipeline() {
  // Doctoral pipeline: stations get stamped as the student token moves along.
  const xs = [40, 88, 136, 184, 232, 280]
  return (
    <g>
      <path d={`M${xs[0]} 72 H${xs.at(-1)}`} stroke={C.line} strokeWidth="2" />
      <path d={`M${xs[0]} 72 H${xs[3]}`} stroke={C.gold} strokeWidth="2" />
      {xs.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="72" r="11" fill={C.ash} stroke={i <= 3 ? C.gold : C.line} strokeWidth="2" />
          {i < 3 && <path d={`M${x - 4} 72 l3 3 l6 -7`} stroke={C.gold} strokeWidth="2" fill="none" />}
        </g>
      ))}
      <rect x={xs[3] - 6} y="40" width="12" height="12" fill={C.gold} />
    </g>
  )
}

function Graph({ r }) {
  // Hospitals as a network; one record's route is highlighted.
  const nodes = Array.from({ length: 11 }, () => [30 + r() * 260, 30 + r() * 120])
  const edges = nodes.map((n, i) => {
    let best = 0
    let d = Infinity
    nodes.forEach((m, j) => {
      const dd = (n[0] - m[0]) ** 2 + (n[1] - m[1]) ** 2
      if (j !== i && dd < d) (d = dd), (best = j)
    })
    return [i, best]
  })
  const route = [0, 3, 6, 9]
  return (
    <g>
      {edges.map(([a, b], k) => (
        <line key={k} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={C.line} strokeWidth="1.5" />
      ))}
      <polyline points={route.map((i) => nodes[i].join(',')).join(' ')} fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="5 4" />
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={route.includes(i) ? 6 : 4} fill={route.includes(i) ? C.gold : C.ash} stroke={C.dust} strokeWidth="1.2" />
        </g>
      ))}
    </g>
  )
}

function Building({ r }) {
  // A block of flats; each window is a unit, lit by its rent status.
  const cells = []
  for (let f = 0; f < 5; f++)
    for (let c = 0; c < 4; c++) {
      const v = r()
      cells.push(<rect key={`${f}-${c}`} x={108 + c * 27} y={34 + f * 25} width="19" height="16" fill={v > 0.82 ? C.gold : v > 0.55 ? C.dust : C.ash} opacity={v > 0.55 ? 0.9 : 1} />)
    }
  return (
    <g>
      <rect x="98" y="24" width="124" height="134" fill="none" stroke={C.dust} strokeWidth="1.5" />
      <path d="M90 24 L160 4 L230 24" fill="none" stroke={C.dust} strokeWidth="1.5" />
      {cells}
      <line x1="20" y1="158" x2="300" y2="158" stroke={C.line} strokeWidth="2" />
    </g>
  )
}

function Waves({ r }) {
  // Sensor streams, one line per device.
  const lines = [0, 1, 2, 3].map((k) => {
    const f = 0.03 + r() * 0.05
    const ph = r() * 6
    const y0 = 42 + k * 34
    const pts = Array.from({ length: 65 }, (_, i) => {
      const x = 16 + i * 4.5
      return `${x.toFixed(1)},${(y0 + Math.sin(x * f + ph) * 9 + Math.sin(x * f * 3.1) * 3).toFixed(1)}`
    })
    return <polyline key={k} points={pts.join(' ')} fill="none" stroke={k === 1 ? C.gold : C.dust} strokeWidth={k === 1 ? 2 : 1.4} />
  })
  return <g>{lines}</g>
}

function Lanes({ r }) {
  // Stores racing in lanes; the cheapest one is marked, not the fastest.
  const runs = [0, 1, 2, 3].map(() => ({ reach: 0.55 + r() * 0.45, price: 20 + r() * 50 }))
  const cheapest = runs.reduce((b, x, i) => (x.price < runs[b].price ? i : b), 0)
  return (
    <g>
      {runs.map((run, i) => {
        const y = 38 + i * 34
        const x = 24 + run.reach * 250
        const win = i === cheapest
        return (
          <g key={i}>
            <line x1="24" y1={y} x2="296" y2={y} stroke={C.line} strokeWidth="1.5" />
            <rect x={x - 9} y={y - 9} width="18" height="18" fill={win ? C.gold : C.ash} stroke={win ? C.gold : C.dust} strokeWidth="1.4" />
            <rect x={x + 14} y={y - 4} width={run.price} height="8" fill={win ? C.gold : C.line} />
          </g>
        )
      })}
      <line x1="296" y1="22" x2="296" y2="150" stroke={C.dust} strokeDasharray="3 3" />
    </g>
  )
}

const MOTIF = { 'phd-erp': Pipeline, carepilot: Graph, rentflow: Building, sensorium: Waves, bazaarlens: Lanes }

/* --- the poster --- */

export default function Art({ title, className = '' }) {
  const r = rng(title.id)
  // Unique per instance: the same poster can appear many times on a page.
  const fadeId = `fade${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const Motif = MOTIF[title.id]
  const tilt = (r() - 0.5) * 30

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`${title.name} poster`} preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill="#17140f" />
      {/* a faint grid, rotated a little differently on every poster */}
      <g opacity="0.35" transform={`rotate(${tilt} ${W / 2} ${H / 2})`}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-80 + i * 36} y1="-80" x2={-80 + i * 36} y2="260" stroke={C.line} />
        ))}
      </g>

      {Motif && <Motif r={r} />}

      {title.kind === 'credential' && (
        <text x="300" y="66" textAnchor="end" fill={C.teal} fontFamily="Big Shoulders Display" fontWeight="900" fontSize={title.result.length > 6 ? 40 : 52}>
          {title.result.toUpperCase()}
        </text>
      )}

      {title.kind === 'experience' && (
        <g>
          <text x="300" y="64" textAnchor="end" fill={C.gold} fontFamily="Big Shoulders Display" fontWeight="900" fontSize="50" opacity="0.9">
            {title.name.split(' ').map((w) => w[0]).join('')}
          </text>
          <line x1="20" y1="82" x2="300" y2="82" stroke={C.line} strokeWidth="2" />
        </g>
      )}

      {title.kind === 'skill' && (
        <g>
          {title.items.slice(0, 4).map((it, i) => (
            <rect key={i} x={230 + i * 18} y={30 + (i % 2) * 8} width="14" height="14" fill={i === 0 ? C.gold : C.ash} stroke={C.dust} />
          ))}
        </g>
      )}

      {/* bottom fade so the title on the card stays readable */}
      <defs>
        <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#0d0b09" stopOpacity="0" />
          <stop offset="1" stopColor="#0d0b09" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${fadeId})`} />
    </svg>
  )
}
