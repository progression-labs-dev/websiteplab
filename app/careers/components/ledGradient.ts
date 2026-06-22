// Shared LED-mosaic gradient sampler. The real brand spectrum stops
// (blush -> orchid -> indigo -> near-black), used by the hero panel and the
// closing CTA. Deterministic per-block brightness jitter (no Math.random).
const STOPS: [number, [number, number, number]][] = [
  [0, [253, 229, 231]], // blush
  [0.34, [181, 121, 206]], // orchid
  [0.72, [27, 18, 169]], // indigo
  [1, [9, 9, 10]], // near-black
]

export function sample(t: number): [number, number, number] {
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i][0]) {
      const [p0, c0] = STOPS[i - 1]
      const [p1, c1] = STOPS[i]
      const f = (t - p0) / (p1 - p0)
      return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * f)) as [number, number, number]
    }
  }
  return STOPS[STOPS.length - 1][1]
}

// Brightness jitter for block index i, factor range ~0.84..1.14.
export function jitter(i: number): number {
  return 0.84 + (((i * 2654435761) % 1000) / 1000) * 0.3
}

export function blockColor(t: number, i: number): string {
  const [r, g, b] = sample(t)
  const k = jitter(i)
  return `rgb(${Math.min(255, Math.round(r * k))}, ${Math.min(255, Math.round(g * k))}, ${Math.min(255, Math.round(b * k))})`
}
