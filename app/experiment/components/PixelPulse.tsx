'use client'

import styles from './PixelPulse.module.css'

interface PixelPulseProps {
  /** Total width/height in px (default 200) */
  size?: number
}

export default function PixelPulse({ size }: PixelPulseProps) {
  return (
    <div
      className={styles.wrapper}
      style={size ? { '--pp-size': `${size}px` } as React.CSSProperties : undefined}
    >
      <div className={styles.grid}>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className={styles.box}
            style={{ animationDelay: isInner(i) ? '0s' : '0.6s' }}
          />
        ))}
      </div>
    </div>
  )
}

/** Inner 2x2 center: indices 5, 6, 9, 10 in a 4x4 grid */
function isInner(index: number): boolean {
  const row = Math.floor(index / 4)
  const col = index % 4
  return row >= 1 && row <= 2 && col >= 1 && col <= 2
}
