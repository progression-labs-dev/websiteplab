'use client'

import styles from './ProcessRings.module.css'

interface ProcessRingsProps {
  /** Total width/height of the ring area in px (default 60) */
  size?: number
  /** Whether to show the "Process" label (default true) */
  showLabel?: boolean
}

export default function ProcessRings({ size, showLabel = true }: ProcessRingsProps) {
  const scaleXValues = [1.2, 1.6, 2.0, 2.4]

  return (
    <div
      className={styles.container}
      style={size ? { '--pr-size': `${size}px` } as React.CSSProperties : undefined}
    >
      <div className={styles.ringWrapper}>
        {scaleXValues.map((peak, i) => (
          <div
            key={i}
            className={styles.ring}
            style={{
              animationName: `stretch-${i}`,
              '--peak': `${peak}`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      {showLabel && <div className={styles.label}>Process</div>}
    </div>
  )
}
