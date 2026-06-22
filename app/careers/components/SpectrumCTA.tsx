import ArrowIcon from '../../experiment/components/ArrowIcon'
import { CLOSING_CTA } from '../data/careersContent'

// The single signature spectrum moment: the real brand gradient
// (blush -> orchid -> indigo -> near-black) rendered as banded LED pixel blocks
// that "power on" diagonally. A horizontal scrim keeps the copy legible on the
// left while the mosaic glows on the right. This is the ONLY gradient on the page.
const COLS = 30
const ROWS = 13
const STOPS: [number, [number, number, number]][] = [
  [0, [253, 229, 231]], // blush
  [0.34, [181, 121, 206]], // orchid
  [0.72, [27, 18, 169]], // indigo
  [1, [9, 9, 10]], // near-black
]

function sample(t: number): [number, number, number] {
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

export default function SpectrumCTA() {
  const { heading, body, primaryCta, secondaryCta } = CLOSING_CTA
  const blocks = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c
      const t = ROWS > 1 ? r / (ROWS - 1) : 0
      const [rr, gg, bb] = sample(t)
      // deterministic per-block brightness jitter (no Math.random)
      const j = ((i * 2654435761) % 1000) / 1000 // 0..1
      const k = 0.84 + j * 0.3 // 0.84..1.14
      const cr = Math.min(255, Math.round(rr * k))
      const cg = Math.min(255, Math.round(gg * k))
      const cb = Math.min(255, Math.round(bb * k))
      const delay = ((r + c) * 22) % 900
      blocks.push(
        <span
          key={i}
          className="careers-cta-px"
          style={{ background: `rgb(${cr}, ${cg}, ${cb})`, animationDelay: `${delay}ms` }}
        />,
      )
    }
  }

  return (
    <section className="careers-cta" id="apply">
      <div
        className="careers-cta-mosaic"
        aria-hidden="true"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
      >
        {blocks}
      </div>
      <div className="careers-cta-scrim" aria-hidden="true" />
      <div className="careers-cta-inner">
        <h2 className="careers-cta-heading">{heading}</h2>
        <p className="careers-cta-body">{body}</p>
        <div className="careers-cta-actions">
          <a href={primaryCta.href} className="exp-btn-filled">
            {primaryCta.label} <ArrowIcon />
          </a>
          <a href={secondaryCta.href} className="exp-btn-outline">
            {secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  )
}
