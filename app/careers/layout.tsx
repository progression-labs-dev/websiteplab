import type { Metadata } from 'next'
import { Sacramento } from 'next/font/google'
import '../experiment/experiment.css'
import './careers.css'

// Signature script font, scoped to the careers route. Used only for the
// animated founder signature (--font-signature).
const signature = Sacramento({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-signature',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Careers | Progression Labs',
  description:
    'Join Progression Labs, a small, senior, AI-leveraged team out-shipping companies many times our size. High agency, total ownership, real speed.',
  // Unlinked preview — keep it out of search indexes until assets land.
  robots: { index: false, follow: false },
}

// Standalone careers route. We wrap in `.experiment` and force `data-theme="light"`
// here so every child resolves the parchment + black-ink token palette without
// depending on the ThemeProvider/ViewModeProvider runtime context used by the
// main /experiment homepage. Mirrors app/experiment/layout.tsx's grain overlay.
export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`experiment ${signature.variable}`} data-theme="light">
      {/* No-JS fallback: force all reveal states visible so content never stays
          hidden if the client bundle fails to run. */}
      <noscript>
        <style>{`.cz-rev{opacity:1!important;transform:none!important}.cz-rt-word{transform:none!important}.cz-rule{transform:scaleX(1)!important}.cz-stagger>*{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      {children}
      {/* Fixed SVG noise/grain texture overlay */}
      <div className="exp-noise" aria-hidden="true">
        <svg>
          <filter id="exp-grain-careers">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#exp-grain-careers)" />
        </svg>
      </div>
    </div>
  )
}
