'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ScrollDecode from './ScrollDecode'
import ArrowIcon from './ArrowIcon'

// Brand palette (synced with hero shader)
const BRAND_COLORS: [number, number, number][] = [
  [186, 85, 211],
  [255, 160, 122],
  [185, 233, 121],
  [64, 224, 208],
  [0, 0, 255],
]
const CYCLE_SEC = 30
function ssmooth(t: number) { return t * t * (3 - 2 * t) }

type Role = 'ceo' | 'cto' | 'product' | 'commercial' | 'other'
type Journey = 'exploring' | 'building' | 'scaling'

interface Recommendation {
  title: string
  desc: string
  services: string[]
  cta: string
}

const roles = [
  { id: 'ceo' as Role, label: 'CEO / Founder' },
  { id: 'cto' as Role, label: 'CTO / VP Engineering' },
  { id: 'product' as Role, label: 'Product Leader' },
  { id: 'commercial' as Role, label: 'Commercial Leader' },
  { id: 'other' as Role, label: 'Other' },
]

const journeys = [
  { id: 'exploring' as Journey, label: 'Exploring AI' },
  { id: 'building' as Journey, label: 'Building with AI' },
  { id: 'scaling' as Journey, label: 'Scaling AI' },
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

export default function FindYourFit() {
  const [step, setStep] = useState(0) // 0 = role, 1 = journey, 2 = result
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null)

  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.default })
  }, [])

  // Color cycling gradient — synced with hero
  useEffect(() => {
    let raf: number
    const startTime = performance.now() / 1000

    const tick = () => {
      if (!labelRef.current) { raf = requestAnimationFrame(tick); return }

      const elapsed = performance.now() / 1000 - startTime
      const progress = (elapsed % CYCLE_SEC) / CYCLE_SEC
      const segProgress = progress * 5
      const segIndex = Math.floor(segProgress) % 5
      const t = ssmooth(segProgress - Math.floor(segProgress))

      const from = BRAND_COLORS[segIndex]
      const to = BRAND_COLORS[(segIndex + 1) % 5]
      const r = Math.round(from[0] + (to[0] - from[0]) * t)
      const g = Math.round(from[1] + (to[1] - from[1]) * t)
      const b = Math.round(from[2] + (to[2] - from[2]) * t)

      labelRef.current.style.backgroundImage = `linear-gradient(
        to bottom,
        rgba(${r}, ${g}, ${b}, 0.8) 0%,
        rgba(${r}, ${g}, ${b}, 0.5) 30%,
        rgba(${r}, ${g}, ${b}, 0.18) 65%,
        transparent 100%
      )`

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // GSAP ScrollTrigger initial reveal
  useEffect(() => {
    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const el = contentRef.current
      if (!el) return

      ctx = gsap.context(() => {
        gsap.set(el, { opacity: 0 })
        gsap.to(el, {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        })
      })
    }

    initGsap()
    return () => { ctx?.revert() }
  }, [])

  const animateTransition = useCallback((callback: () => void) => {
    const gsap = gsapRef.current
    const el = contentRef.current
    if (!gsap || !el) { callback(); return }

    // Lock height to prevent collapse during transition
    el.style.minHeight = `${el.offsetHeight}px`

    gsap.to(el, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        callback()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            gsap.fromTo(el,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                  // Release height lock after transition
                  el.style.minHeight = ''
                },
              }
            )
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
    <div className="exp-12-grid exp-12-grid--half exp-finder">
      {/* Left column */}
      <div ref={labelRef} className="exp-col-label exp-col-label--gradient">
        <div className="exp-tag">Interactive</div>
        <ScrollDecode
          text="Find Your Fit"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
        <p className="exp-label-desc">
          Two questions. One recommendation.
        </p>
        {/* Dot progress indicator */}
        <div className="exp-finder-progress" aria-hidden="true">
          <div className={`exp-finder-dot${step >= 0 ? ' exp-finder-dot--active' : ''}`} />
          <div className={`exp-finder-dot${step >= 1 ? ' exp-finder-dot--active' : ''}`} />
        </div>
      </div>

      {/* Right column — interactive quiz */}
      <div ref={contentRef} className="exp-col-content exp-finder-content" aria-live="polite">
        {step === 0 && (
          <div className="exp-finder-step exp-finder-step--visible">
            <div className="exp-finder-question-num">01 / 02</div>
            <h3 className="exp-finder-question" tabIndex={-1}>What&apos;s your role?</h3>
            <div className="exp-finder-chips">
              {roles.map(role => (
                <button
                  key={role.id}
                  className="exp-finder-chip"
                  onClick={() => handleRoleSelect(role.id)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="exp-finder-step exp-finder-step--visible">
            <div className="exp-finder-question-num">02 / 02</div>
            <h3 className="exp-finder-question" tabIndex={-1}>Where are you on your AI journey?</h3>
            <div className="exp-finder-chips">
              {journeys.map(j => (
                <button
                  key={j.id}
                  className="exp-finder-chip"
                  onClick={() => handleJourneySelect(j.id)}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && recommendation && (
          <div className="exp-finder-step exp-finder-step--visible">
            <div className="exp-finder-result-label">Your recommendation</div>
            <div className="exp-finder-result">
              <div className="exp-finder-result-title">{recommendation.title}</div>
              <div className="exp-finder-result-desc">{recommendation.desc}</div>
              <div className="exp-finder-result-services">
                {recommendation.services.map(s => (
                  <span key={s} className="exp-finder-result-tag">{s}</span>
                ))}
              </div>
              <a href="#contact" className="exp-btn-filled" style={{ marginTop: 24 }}>
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
