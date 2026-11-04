/*
 * Ambient sound, generated live with the Web Audio API, so there is no audio
 * file to download. Two detuned triangle oscillators and a little filtered noise
 * go through a lowpass filter that breathes slowly. The filter opens a little
 * at each stop, so the hum gets "brighter" as the request goes deeper.
 * Off by default; browsers only allow audio after a click anyway.
 */
let ctx, master, filter

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  master = ctx.createGain()
  master.gain.value = 0
  filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 420
  filter.Q.value = 6
  filter.connect(master).connect(ctx.destination)

  ;[55, 55.4, 82.4].forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = i === 2 ? 'sine' : 'triangle'
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.value = i === 2 ? 0.18 : 0.32
    o.connect(g).connect(filter)
    o.start()
  })

  // Pink-ish noise for "air in the server room".
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    d[i] = last * 3.5
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const ng = ctx.createGain()
  ng.gain.value = 0.05
  noise.connect(ng).connect(filter)
  noise.start()

  // Slow LFO on the filter so it never sits still.
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lg = ctx.createGain()
  lg.gain.value = 120
  lfo.connect(lg).connect(filter.frequency)
  lfo.start()
}

export function setSound(on) {
  if (!ctx) build()
  if (on) ctx.resume()
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setTargetAtTime(on ? 0.055 : 0, now, on ? 1.2 : 0.3)
}

/** Called when the active stop changes; index 0..N. */
export function setSoundStop(i) {
  if (!ctx) return
  filter.frequency.setTargetAtTime(380 + i * 70, ctx.currentTime, 1.5)
}
