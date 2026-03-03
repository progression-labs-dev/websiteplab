'use client'

import styles from './BounceRings.module.css'

interface BounceRingsProps {
  /** Width of the icon in px (default 120) */
  size?: number
  /** Whether to show a label beneath (default false) */
  showLabel?: boolean
}

export default function BounceRings({ size, showLabel = false }: BounceRingsProps) {
  return (
    <div className={styles.container}>
      <svg
        className={styles.icon}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        style={size ? { width: size } : undefined}
      >
        <defs>
          <linearGradient id="bounce-grad" gradientUnits="userSpaceOnUse" x1="60" y1="30" x2="60" y2="94">
            <stop offset="0%" className={styles.stopAccent} />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        {/* Bottom to top so they stack correctly */}
        <ellipse cx="60" cy="80" rx="46" ry="14" className={`${styles.ring} ${styles.botRing}`} />
        <ellipse cx="60" cy="70" rx="46" ry="14" className={`${styles.ring} ${styles.midRing}`} />
        <ellipse cx="60" cy="60" rx="46" ry="14" className={`${styles.ring} ${styles.topRing}`} />
      </svg>
      {showLabel && <div className={styles.label}>Role</div>}
    </div>
  )
}
