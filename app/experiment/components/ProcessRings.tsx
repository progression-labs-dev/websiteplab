'use client'

import styles from './ProcessRings.module.css'

interface ProcessRingsProps {
  /** Width of the icon in px (default 120) */
  size?: number
  /** Whether to show the "Process" label (default true) */
  showLabel?: boolean
}

export default function ProcessRings({ size, showLabel = true }: ProcessRingsProps) {
  return (
    <div className={styles.container}>
      <svg
        className={styles.icon}
        viewBox="0 0 140 60"
        xmlns="http://www.w3.org/2000/svg"
        style={size ? { width: size } : undefined}
      >
        <circle cx="70" cy="30" r="22" className={`${styles.ring} ${styles.ring1}`} />
        <circle cx="70" cy="30" r="22" className={`${styles.ring} ${styles.ring2}`} />
        <circle cx="70" cy="30" r="22" className={`${styles.ring} ${styles.ring3}`} />
        <circle cx="70" cy="30" r="22" className={`${styles.ring} ${styles.ring4}`} />
      </svg>
      {showLabel && <div className={styles.label}>Process</div>}
    </div>
  )
}
