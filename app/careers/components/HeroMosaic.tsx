import { blockColor } from './ledGradient'

// The hero's living element: the brand's signature spectrum as a square LED
// mosaic that slowly breathes (blocks pulse opacity on a staggered diagonal).
// The on-brand, abstract answer to Halfspace's motion video. No photography.
const COLS = 15
const ROWS = 15

export default function HeroMosaic() {
  const blocks = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c
      const t = ROWS > 1 ? r / (ROWS - 1) : 0
      const delay = ((r + c) % 10) * 0.28
      blocks.push(
        <span
          key={i}
          className="cz-led"
          style={{ background: blockColor(t, i), animationDelay: `${delay}s` }}
        />,
      )
    }
  }
  return (
    <div
      className="careers-hero-mosaic"
      aria-hidden="true"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
    >
      {blocks}
    </div>
  )
}
