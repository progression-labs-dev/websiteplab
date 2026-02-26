import type { Metadata } from 'next'
import './experiment.css'

export const metadata: Metadata = {
  title: 'Progression Labs — AI That Ships',
  description: 'Custom AI agents that scale for the most complex problems in the real world.',
}

export default function ExperimentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="experiment">
      {children}
      {/* Fixed SVG noise/grain texture overlay */}
      <div className="exp-noise" aria-hidden="true">
        <svg>
          <filter id="exp-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#exp-grain)" />
        </svg>
      </div>
    </div>
  )
}
