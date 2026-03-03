'use client'

import styles from './ProcessRings.module.css'

interface ProcessRingsProps {
  /** Height of the SVG in px (default 80) */
  size?: number
  /** Whether to show the "Process" label (default true) */
  showLabel?: boolean
}

export default function ProcessRings({ size = 80, showLabel = true }: ProcessRingsProps) {
  // Scale SVG proportionally — viewBox stays 160x80, rendered size scales
  const width = size * 2
  const height = size

  return (
    <div className={styles.container}>
      <svg viewBox="0 0 160 80" width={width} height={height}>
        <circle cx="80" cy="40" r="25" className={`${styles.ring} ${styles.ring1}`} />
        <circle cx="80" cy="40" r="25" className={`${styles.ring} ${styles.ring2}`} />
        <circle cx="80" cy="40" r="25" className={`${styles.ring} ${styles.ring3}`} />
        <circle cx="80" cy="40" r="25" className={`${styles.ring} ${styles.ring4}`} />
      </svg>
      {showLabel && <div className={styles.label}>Process</div>}
    </div>
  )
}
