'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ShuffleHover from './ShuffleHover'
import ArrowIcon from './ArrowIcon'
import { NAV_LINKS } from '../data/siteContent'

interface ExperimentNavProps {
  showBrand?: boolean
  // On pages without a dark hero (e.g. case study routes), force the nav
  // into its light-mode palette from the start instead of waiting for the
  // scroll threshold to flip it.
  forceLight?: boolean
}

const ExperimentNav = forwardRef<HTMLElement, ExperimentNavProps>(
  function ExperimentNav({ showBrand = false, forceLight = false }, ref) {
    const navRef = useRef<HTMLElement | null>(null)
    useImperativeHandle(ref, () => navRef.current as HTMLElement)

    // Hybrid design: nav sits over the dark hero at the top of the page and
    // over the parchment body once you scroll past it. Toggle a flag so the
    // CSS can swap text/border colours to stay legible against the surface
    // behind it.
    const [overLight, setOverLight] = useState(forceLight)

    useEffect(() => {
      if (forceLight) {
        setOverLight(true)
        return
      }
      const onScroll = () => {
        // The hero fades over the first viewport-height of scroll. Switch
        // nav contrast at ~40% of that fade so the nav swaps to royal-blue
        // ink while the bg behind it is transitioning past 50%-parchment —
        // keeps the text readable through the whole fade. Without this
        // earlier threshold the nav stays white-on-darkening-bg and the
        // text disappears against the lightening parchment behind.
        const threshold = window.innerHeight * 0.4
        setOverLight(window.scrollY > threshold)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }, [forceLight])

    return (
      <nav
        ref={navRef}
        className="exp-nav"
        data-over-light={overLight ? 'true' : 'false'}
        style={{ opacity: 0 }}
      >
        {/* Column 1: P-logo (tinted via mask + currentColor) + Brand name */}
        <div className="exp-nav-logo-group">
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
