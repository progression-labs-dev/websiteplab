'use client'

import { useRef, useState } from 'react'
import HeroSection from './components/HeroSection'
import ExperimentNav from './components/ExperimentNav'
import LogoMarquee from './components/LogoMarquee'
import ProofSection from './components/ProofSection'
import MethodSection from './components/MethodSection'
import ServicesSection from './components/ServicesSection'
import ConvergenceSection from './components/ConvergenceSection'
import ExperimentTeamSection from './components/ExperimentTeamSection'
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

      {/* Logo carousel — clean black gap, no divider above */}
      <div className="exp-logo-carousel">
        <LogoMarquee />
      </div>

      <PlusDivider />

      <section id="work">
        <ProofSection />
      </section>

      <PlusDivider />

      <section id="method">
        <MethodSection />
      </section>

      <PlusDivider />

      <section id="services">
        <ServicesSection />
      </section>

      <PlusDivider />

      <ConvergenceSection />

      <PlusDivider />

      <section id="team">
        <ExperimentTeamSection />
      </section>

      <PlusDivider />

      <section id="contact">
        <CTASection />
      </section>
    </>
  )
}
