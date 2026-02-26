'use client'

import ConvergenceCanvas from './ConvergenceCanvas'

export default function ConvergenceSection() {
  return (
    <div
      style={{
        maxWidth: 'var(--exp-container)',
        margin: '0 auto',
        padding: 'var(--exp-section-pad) 32px',
      }}
    >
      <ConvergenceCanvas />
    </div>
  )
}
