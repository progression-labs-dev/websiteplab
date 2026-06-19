'use client'

import Link from 'next/link'
import ArrowIcon from '../../experiment/components/ArrowIcon'

/**
 * CareersNav — lightweight, always-visible nav for the /careers route.
 *
 * We intentionally do NOT reuse ExperimentNav: it hard-codes `opacity: 0` and
 * relies on the homepage's GSAP reveal sequence (which never runs here). This
 * reuses the same `.exp-nav` / `.exp-btn-filled` classes and the masked P-logo
 * link pattern, forced into the light (parchment) palette via data-theme/
 * data-over-light, and is visible on mount.
 */
export default function CareersNav() {
  return (
    <nav className="exp-nav" data-over-light="true" data-theme="light">
      {/* Logo + wordmark → home */}
      <Link
        href="/"
        aria-label="Progression Labs — home"
        className="exp-nav-logo-group exp-nav-logo-link"
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
        <span className="exp-nav-brand">Progression Labs</span>
      </Link>

      {/* Center links — careers-local anchors */}
      <ul className="exp-nav-links">
        <li><a href="#why">Why us</a></li>
        <li><a href="#open-roles">Open roles</a></li>
        <li><a href="#team">Team</a></li>
      </ul>

      {/* CTA → roles */}
      <div className="exp-nav-cta">
        <a href="#open-roles" className="exp-btn-filled">
          View open roles <ArrowIcon />
        </a>
      </div>
    </nav>
  )
}
