import ArrowIcon from '../../experiment/components/ArrowIcon'
import { blockColor } from './ledGradient'
import { CLOSING_CTA } from '../data/careersContent'

// The closing signature spectrum moment: the real brand gradient rendered as
// banded LED pixel blocks that "power on" diagonally. A horizontal scrim keeps
// the copy legible on the left while the mosaic glows on the right.
const COLS = 30
const ROWS = 13

export default function SpectrumCTA() {
  const { heading, body, primaryCta, secondaryCta } = CLOSING_CTA
  const blocks = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c
      const t = ROWS > 1 ? r / (ROWS - 1) : 0
      const delay = ((r + c) * 22) % 900
      blocks.push(
        <span
          key={i}
          className="careers-cta-px"
          style={{ background: blockColor(t, i), animationDelay: `${delay}ms` }}
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
