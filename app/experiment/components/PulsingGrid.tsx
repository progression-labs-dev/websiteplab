'use client'

import styles from './PulsingGrid.module.css'

interface PulsingGridProps {
  /** Total width/height of the grid in px (default 270 = 3×80 + 2×15 gap) */
  size?: number
}

export default function PulsingGrid({ size }: PulsingGridProps) {
  return (
    <div
      className={styles.wrapper}
      style={size ? { '--pg-size': `${size}px` } as React.CSSProperties : undefined}
    >
      <div className={styles.grid}>
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={styles.box}
            style={{ animationDelay: `${getDelay(i)}s` }}
          />
        ))}
      </div>
    </div>
  )
}

/** Diagonal wave delay: top-left 0s → bottom-right 0.4s */
function getDelay(index: number): number {
  const row = Math.floor(index / 3)
  const col = index % 3
  return (row + col) * 0.1
}
