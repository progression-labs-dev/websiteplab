'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import Link from 'next/link'
import ShuffleHover from './ShuffleHover'
import ArrowIcon from './ArrowIcon'
import { NAV_LINKS } from '../data/siteContent'

interface ExperimentNavProps {
  showBrand?: boolean
  // On pages with a parchment surface (e.g. case study routes), force the
  // nav into its light-mode palette. The main /experiment page is fully
  // dark, so this is opt-in per route.
  forceLight?: boolean
}

const ExperimentNav = forwardRef<HTMLElement, ExperimentNavProps>(
  function ExperimentNav({ showBrand = false, forceLight = false }, ref) {
    const navRef = useRef<HTMLElement | null>(null)
    useImperativeHandle(ref, () => navRef.current as HTMLElement)

    return (
      <nav
        ref={navRef}
        className="exp-nav"
        data-over-light={forceLight ? 'true' : 'false'}
        style={{ opacity: 0 }}
      >
        {/* Column 1: P-logo (tinted via mask + currentColor) + Brand name —
            clickable, routes to the home page. */}
        <Link
          href="/experiment"
          aria-label="Progression Labs — home"
          className="exp-nav-logo-group exp-nav-logo-link"
          onClick={() => {
            // If already on /experiment, the route change is a no-op — scroll
            // to the top so the logo still feels responsive as a "home" link.
            if (typeof window !== 'undefined' && window.location.pathname === '/experiment') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          <div className="exp-nav-logo">
            <span
              role="img"
              aria-label="Progression Labs"
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                backgroundColor: 'var(--exp-text-primary)',
                WebkitMaskImage: 'url(/logo-white.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo-white.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
          </div>
          <span
            className="exp-nav-brand"
            style={{ opacity: showBrand ? 1 : 0 }}
          >
            Progression Labs
          </span>
        </Link>

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
