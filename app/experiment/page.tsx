'use client'

import { useRef, useState } from 'react'
import HeroSection from './components/HeroSection'
import ExperimentNav from './components/ExperimentNav'
import LogoMarquee from './components/LogoMarquee'
import FindYourFit from './components/FindYourFit'
import ProofSection from './components/ProofSection'
import CTASection from './components/CTASection'
import PlusDivider from './components/PlusDivider'

export default function ExperimentPage() {
  const navRef = useRef<HTMLElement>(null)
  const [showBrand, setShowBrand] = useState(false)

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

      <section id="contact">
        <CTASection />
      </section>
    </>
  )
}
