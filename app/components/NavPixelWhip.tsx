'use client'

const PIXEL_COUNT = 14
const PIXEL_GAP_PERCENT = 1.2 // % gap between pixels

export default function NavPixelWhip() {
  const pixelWidth = (100 - PIXEL_GAP_PERCENT * (PIXEL_COUNT - 1)) / PIXEL_COUNT

  return (
    <span className="nav-pixel-whip" aria-hidden="true">
      {Array.from({ length: PIXEL_COUNT }, (_, i) => (
        <span
          key={i}
          className="nav-pixel"
          style={{
            left: `${i * (pixelWidth + PIXEL_GAP_PERCENT)}%`,
            width: `${pixelWidth}%`,
            transitionDelay: `${i * 25}ms`,
          }}
        />
      ))}
    </span>
  )
}
