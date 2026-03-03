'use client'

import { forwardRef } from 'react'
import ShuffleHover from './ShuffleHover'
import ArrowIcon from './ArrowIcon'
import { useTheme } from './ThemeProvider'

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
    const { toggleTheme, isDark } = useTheme()

    return (
      <nav ref={ref} className="exp-nav" style={{ opacity: 0 }}>
        {/* Column 1: SVG P-logo + Brand name */}
        <div className="exp-nav-logo-group">
          <div className="exp-nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isDark ? '/logo-white.png' : '/logo-black.png'}
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
        {/* Theme toggle — uncomment to re-enable:
        <button
          onClick={toggleTheme}
          className="exp-theme-toggle"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="8" cy="8" r="3" /><line x1="8" y1="1" x2="8" y2="3" /><line x1="8" y1="13" x2="8" y2="15" />
              <line x1="1" y1="8" x2="3" y2="8" /><line x1="13" y1="8" x2="15" y2="8" />
              <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" /><line x1="11.54" y1="11.54" x2="12.95" y2="12.95" />
              <line x1="3.05" y1="12.95" x2="4.46" y2="11.54" /><line x1="11.54" y1="4.46" x2="12.95" y2="3.05" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M13.5 8.5a5.5 5.5 0 0 1-6-6 5.5 5.5 0 1 0 6 6z" />
            </svg>
          )}
        </button>
        */}
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
