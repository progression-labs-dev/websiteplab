'use client'

import { useRef, useState, useEffect } from 'react'
import HeroSection from './components/HeroSection'
import ExperimentNav from './components/ExperimentNav'
import LogoMarquee from './components/LogoMarquee'
import FindYourFit from './components/FindYourFit'
import ProofSection from './components/ProofSection'
// import ExperimentTeamSection from './components/ExperimentTeamSection'
import CTASection from './components/CTASection'
import BlogSection from './components/BlogSection'
import PlusDivider from './components/PlusDivider'
import PostHogTracker from './components/PostHogTracker'

export default function ExperimentPage() {
  const navRef = useRef<HTMLElement>(null)
  const [showBrand, setShowBrand] = useState(false)

  // Force scroll to top on page load — prevents browser restoring scroll to a hash anchor
  useEffect(() => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname)
    }
    window.scrollTo(0, 0)
  }, [])

  const handleNavReveal = () => {
    if (navRef.current) {
      navRef.current.style.opacity = '1'
    }
  }

  const handleBrandReveal = () => {
    setShowBrand(true)
  }

  return (
    <>
      <PostHogTracker />
      <ExperimentNav ref={navRef} showBrand={showBrand} />
      <HeroSection onNavReveal={handleNavReveal} onBrandReveal={handleBrandReveal} />

      {/* Selective partner proof — AWS logo only */}
      <div className="exp-logo-carousel">
        <LogoMarquee />
      </div>

      <PlusDivider />

      {/* Centerpiece: interactive service finder */}
      <section id="services">
        <FindYourFit />
      </section>

      <PlusDivider />

      {/* Testimonials — single rotating quote */}
      <section id="work">
        <ProofSection />
      </section>

      <PlusDivider />

      {/* Blog — Karpathy-inspired AI insights */}
      <section id="lab">
        <BlogSection />
      </section>

      <PlusDivider />

      <section id="contact">
        <CTASection />
      </section>
    </>
  )
}
