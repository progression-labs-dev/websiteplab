'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import HeroSection from './components/HeroSection'
import ExperimentNav from './components/ExperimentNav'
import FindYourFit from './components/FindYourFit'
import ProofSection from './components/ProofSection'
import CTASection from './components/CTASection'
import PlusDivider from './components/PlusDivider'
import PostHogTracker from './components/PostHogTracker'
import ViewModeToggle from './components/ViewModeToggle'
import ViewTransition from './components/ViewTransition'
import MachineView from './components/MachineView'
import { useViewMode } from './components/ViewModeProvider'

export default function ExperimentPage() {
  const navRef = useRef<HTMLElement>(null)
  const [showBrand, setShowBrand] = useState(false)
  const { viewMode, isMachine } = useViewMode()
  const prevModeRef = useRef(viewMode)

  // Force scroll to top on page load
  useEffect(() => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname)
    }
    window.scrollTo(0, 0)
  }, [])

  // Track scroll percentage continuously for cross-view mapping
  const scrollPctRef = useRef(0)
  useEffect(() => {
    const track = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollPctRef.current = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener('scroll', track, { passive: true })
    track()
    return () => window.removeEventListener('scroll', track)
  }, [])

  // Hybrid design: hero fades out as the user scrolls past its first
  // viewport-height. Updates a CSS variable that .exp-hero-sticky reads
  // for its opacity. By the time scrollY === innerHeight, the hero is
  // fully transparent and the parchment world below is in view.
  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
      document.documentElement.style.setProperty('--hero-fade', String(1 - progress))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hard-cut scroll sync: capture percentage before swap, apply after
  useEffect(() => {
    if (prevModeRef.current === viewMode) return
    const savedPct = scrollPctRef.current
    prevModeRef.current = viewMode

    // Stop Lenis so it doesn't fight the instant scroll
    const lenis = (window as any).__lenis
    if (lenis) lenis.stop()

    // Single rAF — display swap already happened synchronously in this render,
    // so the new view is laid out by the next frame
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(savedPct * max))

      // Resume Lenis with fresh layout knowledge
      if (lenis) {
        lenis.resize()
        lenis.start()
      }
    })
  }, [viewMode])

  const handleNavReveal = useCallback(() => {
    if (navRef.current) {
      navRef.current.style.opacity = '1'
    }
  }, [])

  const handleBrandReveal = useCallback(() => {
    setShowBrand(true)
  }, [])

  return (
    <>
      <PostHogTracker />
      <ViewModeToggle />
      <ViewTransition />

      {/* Both views always mounted — hard cut via display swap in single render frame */}
      <div style={{ display: isMachine ? 'none' : 'contents' }}>
        <ExperimentNav ref={navRef} showBrand={showBrand} />

        {/* Sticky hero — pinned to viewport top for one viewport-height so
            the parchment body below it scrolls up over it (instead of the
            hero scrolling out the top). */}
        <div className="exp-hero-sticky">
          <div data-section="hero">
            <HeroSection onNavReveal={handleNavReveal} onBrandReveal={handleBrandReveal} />
          </div>
        </div>

        {/* Body sections sit below the sticky hero on the same dark surface.
            Proof comes first to put the Globo testimonial + video immediately
            below the hero, then FindYourFit, then the CTA/footer. */}
        <div>
          <section id="work" data-section="work">
            <ProofSection />
          </section>

          <PlusDivider />

          <section id="services" data-section="services">
            <FindYourFit />
          </section>

          <PlusDivider />

          <section id="contact" data-section="contact">
            <CTASection />
          </section>
        </div>
      </div>

      <div style={{ display: isMachine ? 'contents' : 'none' }}>
        <MachineView />
      </div>
    </>
  )
}
