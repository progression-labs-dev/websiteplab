'use client'

import { forwardRef } from 'react'
import ShuffleHover from './ShuffleHover'
import ArrowIcon from './ArrowIcon'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Proof', href: '#work' },
  { label: 'Team', href: '#team' },
  { label: 'Contact', href: '#contact' },
]

interface ExperimentNavProps {
  showBrand?: boolean
}

const ExperimentNav = forwardRef<HTMLElement, ExperimentNavProps>(
  function ExperimentNav({ showBrand = false }, ref) {
    return (
      <nav ref={ref} className="exp-nav" style={{ opacity: 0 }}>
        {/* Column 1: SVG P-logo + Brand name */}
        <div className="exp-nav-logo-group">
          <div className="exp-nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-white.png"
              alt="Progression Labs"
              style={{ height: 28, width: 'auto' }}
            />
          </div>
          <span
            className="exp-nav-brand"
            style={{ opacity: showBrand ? 1 : 0 }}
          >
            Progression Labs
          </span>
        </div>

        {/* Column 2: Centered links with shuffle hover */}
        <ul className="exp-nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <ShuffleHover
                text={label}
                tag="a"
                href={href}
              />
            </li>
          ))}
        </ul>

        {/* Column 3: CTA button */}
        <div className="exp-nav-cta">
          <a href="#contact" className="exp-btn-outline">
            Get in touch <ArrowIcon />
          </a>
        </div>
      </nav>
    )
  }
)

export default ExperimentNav
