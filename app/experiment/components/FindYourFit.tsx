'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ScrollDecode from './ScrollDecode'
import ArrowIcon from './ArrowIcon'

type Role = 'ceo' | 'cto' | 'product' | 'commercial' | 'other'
type Journey = 'exploring' | 'building' | 'scaling'

interface RoleOption {
  id: Role
  label: string
}

interface JourneyOption {
  id: Journey
  label: string
  desc: string
}

interface Recommendation {
  title: string
  desc: string
  services: string[]
  cta: string
}

const roles: RoleOption[] = [
  { id: 'ceo', label: 'CEO / Founder' },
  { id: 'cto', label: 'CTO / VP Engineering' },
  { id: 'product', label: 'Product Leader' },
  { id: 'commercial', label: 'Commercial Leader' },
  { id: 'other', label: 'Other' },
]

const journeys: JourneyOption[] = [
  { id: 'exploring', label: 'Exploring AI', desc: 'We\'re assessing where AI fits in our business' },
  { id: 'building', label: 'Building with AI', desc: 'We have a clear use case and need to ship' },
  { id: 'scaling', label: 'Scaling AI', desc: 'We have AI in production and need to grow it' },
]

const recommendations: Record<string, Recommendation> = {
  'ceo-exploring': {
    title: 'AI Transformation + Ideation Sessions',
    desc: 'Start with a strategic assessment to identify high-impact AI opportunities, then run structured workshops with your leadership team to build conviction and a concrete roadmap.',
    services: ['AI Transformation', 'Ideation Sessions', 'AI Audit'],
    cta: 'Book a strategy session',
  },
  'ceo-building': {
    title: 'AI Builds + AI Expert',
    desc: 'Full-stack AI product development with senior engineers embedded in your team. We build production software, not prototypes — and your team learns alongside ours.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start building',
  },
  'ceo-scaling': {
    title: 'AI Transformation + AI Expert',
    desc: 'Strategic advisory to optimise and expand your AI operations. We help you build the internal capability to scale independently.',
    services: ['AI Transformation', 'AI Expert', 'AI Audit'],
    cta: 'Scale with us',
  },
  'cto-exploring': {
    title: 'AI Audit + Ideation Sessions',
    desc: 'Deep-dive technical assessment of your AI readiness — infrastructure, data, team skills. We deliver a prioritised roadmap your engineering team can execute.',
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Get your audit',
  },
  'cto-building': {
    title: 'AI Builds + Project Surgery',
    desc: 'Our senior engineers pair with yours to build production AI. If you have stalled projects, we diagnose and fix. Code you own, knowledge you keep.',
    services: ['AI Builds', 'AI Expert', 'Project Surgery'],
    cta: 'Start building',
  },
  'cto-scaling': {
    title: 'AI Expert + AI Builds',
    desc: 'On-demand access to senior AI engineers who embed within your team. Scale your AI capability without the hiring lag.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Scale your team',
  },
  'product-exploring': {
    title: 'Ideation Sessions + AI Audit',
    desc: 'Structured workshops that turn product challenges into AI-powered features. Leave with prototyped concepts and a concrete action plan.',
    services: ['Ideation Sessions', 'AI Audit'],
    cta: 'Book a workshop',
  },
  'product-building': {
    title: 'AI Builds + AI Expert',
    desc: 'End-to-end AI product development. We work alongside your product team from spec to ship, building features your users will love.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Ship your feature',
  },
  'product-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: 'Embed senior AI expertise into your product org. We help you build the processes and capabilities to ship AI features at scale.',
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Level up your team',
  },
  'commercial-exploring': {
    title: 'AI Transformation + Ideation Sessions',
    desc: 'Understand where AI creates commercial value. We map opportunities across your business and help you build the case for investment.',
    services: ['AI Transformation', 'Ideation Sessions'],
    cta: 'Explore opportunities',
  },
  'commercial-building': {
    title: 'AI Builds + AI Transformation',
    desc: 'Turn commercial AI opportunities into working products. We build the tools and automations that drive revenue and efficiency.',
    services: ['AI Builds', 'AI Transformation'],
    cta: 'Build for growth',
  },
  'commercial-scaling': {
    title: 'AI Transformation + AI Expert',
    desc: 'Scale AI across your commercial operations. We help you expand what\'s working and build new AI-driven revenue streams.',
    services: ['AI Transformation', 'AI Expert'],
    cta: 'Scale your AI',
  },
  'other-exploring': {
    title: 'AI Audit + Ideation Sessions',
    desc: 'Start with a comprehensive assessment and hands-on workshop. We\'ll help you find the right starting point for your AI journey.',
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Get started',
  },
  'other-building': {
    title: 'AI Builds + AI Expert',
    desc: 'Full-stack AI development with senior engineers. We build production-grade software tailored to your specific needs.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start building',
  },
  'other-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: 'Expert guidance to grow and optimise your AI operations. We embed senior talent and strategic advisory to help you scale.',
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Scale with us',
  },
}

// Binary scramble for transitions
const SCRAMBLE_CHARS = '01'
function scrambleText(text: string): string {
  return text.split('').map(c =>
    c === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * 2)]
  ).join('')
}

export default function FindYourFit() {
  const [step, setStep] = useState(0) // 0 = role, 1 = journey, 2 = result
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null)

  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.default })
  }, [])

  const animateTransition = useCallback((callback: () => void) => {
    const gsap = gsapRef.current
    if (!gsap) { callback(); return }

    const container = document.querySelector('.exp-finder-options')
    if (!container) { callback(); return }

    gsap.to(container, {
      opacity: 0,
      y: -20,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        callback()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const newContainer = document.querySelector('.exp-finder-options')
            if (newContainer) {
              gsap.fromTo(newContainer,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
              )
            }
          })
        })
      },
    })
  }, [])

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role)
    animateTransition(() => setStep(1))
  }, [animateTransition])

  const handleJourneySelect = useCallback((journey: Journey) => {
    setSelectedJourney(journey)
    animateTransition(() => setStep(2))
  }, [animateTransition])

  const handleReset = useCallback(() => {
    animateTransition(() => {
      setStep(0)
      setSelectedRole(null)
      setSelectedJourney(null)
    })
  }, [animateTransition])

  const recommendation = selectedRole && selectedJourney
    ? recommendations[`${selectedRole}-${selectedJourney}`]
    : null

  return (
    <div className="exp-12-grid exp-12-grid--half">
      {/* Left column */}
      <div className="exp-col-label">
        <div className="exp-tag">Interactive</div>
        <ScrollDecode
          text="Find Your Fit"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
        <p className="exp-label-desc">
          Two quick questions. Your personalised recommendation in seconds.
        </p>
        {/* Step indicator */}
        <div className="exp-finder-steps">
          <span className={`exp-finder-step ${step >= 0 ? 'exp-finder-step--active' : ''}`}>01</span>
          <span className="exp-finder-step-divider">/</span>
          <span className={`exp-finder-step ${step >= 1 ? 'exp-finder-step--active' : ''}`}>02</span>
        </div>
      </div>

      {/* Right column — interactive quiz */}
      <div className="exp-col-content">
        {step === 0 && (
          <div className="exp-finder-options">
            <div className="exp-finder-question">What&apos;s your role?</div>
            {roles.map(role => (
              <button
                key={role.id}
                className="exp-finder-option"
                onClick={() => handleRoleSelect(role.id)}
              >
                <span className="exp-finder-option-label">{role.label}</span>
                <ArrowIcon />
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="exp-finder-options">
            <div className="exp-finder-question">Where are you on your AI journey?</div>
            {journeys.map(j => (
              <button
                key={j.id}
                className="exp-finder-option"
                onClick={() => handleJourneySelect(j.id)}
              >
                <span className="exp-finder-option-label">{j.label}</span>
                <span className="exp-finder-option-desc">{j.desc}</span>
                <ArrowIcon />
              </button>
            ))}
          </div>
        )}

        {step === 2 && recommendation && (
          <div className="exp-finder-options" ref={resultRef}>
            <div className="exp-finder-question">Your recommendation</div>
            <div className="exp-finder-result">
              <div className="exp-finder-result-title">{recommendation.title}</div>
              <div className="exp-finder-result-desc">{recommendation.desc}</div>
              <div className="exp-finder-result-services">
                {recommendation.services.map(s => (
                  <span key={s} className="exp-finder-result-tag">{s}</span>
                ))}
              </div>
              <a href="#contact" className="exp-btn-outline" style={{ marginTop: 24 }}>
                {recommendation.cta} <ArrowIcon />
              </a>
            </div>
            <button className="exp-finder-reset" onClick={handleReset}>
              Start again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
