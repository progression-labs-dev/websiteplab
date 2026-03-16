'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ScrollDecode from './ScrollDecode'
import ArrowIcon from './ArrowIcon'
import StepIcons from './StepIcons'
import { useColorCycle } from './useColorCycle'
import PixelGradientCanvas from './PixelGradientCanvas'
import FinderAsciiOverlay from './FinderAsciiOverlay'
import { BRAINSTORM_HREF, openBrainstormEmail } from './brainstormMailto'
import posthog from 'posthog-js'

const TYPING_SPEED = 35 // ms per character

type Role = 'ceo' | 'cto' | 'product' | 'commercial' | 'other'
type Journey = 'no_start' | 'know_what' | 'stuck' | 'need_hands' | 'scaling'

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
  { id: 'no_start' as Journey, label: "We haven't started with AI" },
  { id: 'know_what' as Journey, label: 'We know what we want to build' },
  { id: 'stuck' as Journey, label: "We started but hit a wall" },
  { id: 'need_hands' as Journey, label: "We're building, need more hands" },
  { id: 'scaling' as Journey, label: "We're live and need to scale" },
]

const recommendations: Record<string, Recommendation> = {
  // ── CEO / Founder ──
  'ceo-no_start': {
    title: 'Find your highest-impact AI opportunity',
    desc: 'You know AI matters, but it\'s hard to know where to start without wasting budget on the wrong thing. We run a focused strategy session with your leadership team and leave you with a clear, prioritised roadmap — not a slide deck.',
    services: ['AI Transformation', 'Ideation Sessions', 'AI Audit'],
    cta: 'Request a brainstorm',
  },
  'ceo-know_what': {
    title: 'Go from vision to production, fast',
    desc: 'You\'ve got the idea — now you need the team to build it properly. Our senior engineers embed alongside yours and ship production software from week one. You keep the code and the knowledge.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Request a brainstorm',
  },
  'ceo-stuck': {
    title: 'Get your AI project back on track',
    desc: 'You\'ve invested time and budget, and it\'s not delivering yet. That\'s more common than you\'d think. We diagnose what stalled — architecture, data, team gaps — and fix it, usually within weeks.',
    services: ['Project Surgery', 'AI Expert', 'AI Audit'],
    cta: 'Request a brainstorm',
  },
  'ceo-need_hands': {
    title: 'Senior AI engineers, shipping from day one',
    desc: 'Hiring takes months. You need capacity now. Our engineers embed in your team immediately — no recruitment cycles, no ramp-up. They know the stack and start delivering from week one.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Request a brainstorm',
  },
  'ceo-scaling': {
    title: 'Scale what\'s working without breaking it',
    desc: 'Your AI is live and delivering value — now you need to expand without losing quality or velocity. We help you build the internal capability to scale independently, so you don\'t need us forever.',
    services: ['AI Transformation', 'AI Expert', 'AI Audit'],
    cta: 'Request a brainstorm',
  },

  // ── CTO / VP Engineering ──
  'cto-no_start': {
    title: 'AI Audit + Ideation Sessions',
    desc: 'Deep-dive technical assessment of your AI readiness — infrastructure, data, team skills. We deliver a prioritised roadmap your engineering team can execute.',
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Get your audit',
  },
  'cto-know_what': {
    title: 'AI Builds + AI Expert',
    desc: 'Our senior engineers pair with yours to build production AI. Code you own, knowledge you keep. We handle the ML complexity so your team stays focused.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start building',
  },
  'cto-stuck': {
    title: 'Project Surgery + AI Audit',
    desc: 'We diagnose the technical blockers — architecture, data pipeline, model performance, or integration issues — and get your project back on track with a clear fix.',
    services: ['Project Surgery', 'AI Audit', 'AI Expert'],
    cta: 'Fix what\'s broken',
  },
  'cto-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: 'Senior AI engineers who embed in your team and ship from day one. No recruitment cycles, no ramp-up — they know the stack and hit the ground running.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Add senior talent',
  },
  'cto-scaling': {
    title: 'AI Expert + AI Builds',
    desc: 'On-demand access to senior AI engineers who embed within your team. Scale your AI capability without the hiring lag.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Scale your team',
  },

  // ── Product Leader ──
  'product-no_start': {
    title: 'Ideation Sessions + AI Audit',
    desc: 'Structured workshops that turn product challenges into AI-powered features. Leave with prototyped concepts and a concrete action plan.',
    services: ['Ideation Sessions', 'AI Audit'],
    cta: 'Book a workshop',
  },
  'product-know_what': {
    title: 'AI Builds + AI Expert',
    desc: 'End-to-end AI product development. We work alongside your product team from spec to ship, building features your users will love.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Ship your feature',
  },
  'product-stuck': {
    title: 'Project Surgery + AI Builds',
    desc: 'We diagnose why the feature stalled — scope, data, model fit, or UX — then rebuild with a clear path to ship. No more spinning wheels.',
    services: ['Project Surgery', 'AI Builds'],
    cta: 'Get unstuck',
  },
  'product-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: 'Senior AI product engineers who slot into your team and ship features. They understand product thinking, not just model training.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Accelerate your roadmap',
  },
  'product-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: 'Embed senior AI expertise into your product org. We help you build the processes and capabilities to ship AI features at scale.',
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Level up your team',
  },

  // ── Commercial Leader ──
  'commercial-no_start': {
    title: 'AI Transformation + Ideation Sessions',
    desc: 'Understand where AI creates commercial value. We map opportunities across your business and help you build the case for investment.',
    services: ['AI Transformation', 'Ideation Sessions'],
    cta: 'Explore opportunities',
  },
  'commercial-know_what': {
    title: 'AI Builds + AI Transformation',
    desc: 'Turn commercial AI opportunities into working products. We build the tools and automations that drive revenue and efficiency.',
    services: ['AI Builds', 'AI Transformation'],
    cta: 'Build for growth',
  },
  'commercial-stuck': {
    title: 'Project Surgery + AI Transformation',
    desc: 'We diagnose why your AI initiative isn\'t delivering commercial results — misaligned KPIs, wrong use case, or execution gaps — and course-correct.',
    services: ['Project Surgery', 'AI Transformation'],
    cta: 'Course-correct now',
  },
  'commercial-need_hands': {
    title: 'AI Builds + AI Expert',
    desc: 'More engineering capacity to ship your commercial AI projects. Our team builds the tools and integrations that drive measurable business impact.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Add capacity',
  },
  'commercial-scaling': {
    title: 'AI Transformation + AI Expert',
    desc: 'Scale AI across your commercial operations. We help you expand what\'s working and build new AI-driven revenue streams.',
    services: ['AI Transformation', 'AI Expert'],
    cta: 'Scale your AI',
  },

  // ── Other ──
  'other-no_start': {
    title: 'AI Audit + Ideation Sessions',
    desc: 'Start with a comprehensive assessment and hands-on workshop. We\'ll help you find the right starting point for your AI journey.',
    services: ['AI Audit', 'Ideation Sessions'],
    cta: 'Get started',
  },
  'other-know_what': {
    title: 'AI Builds + AI Expert',
    desc: 'Full-stack AI development with senior engineers. We build production-grade software tailored to your specific needs.',
    services: ['AI Builds', 'AI Expert'],
    cta: 'Start building',
  },
  'other-stuck': {
    title: 'Project Surgery + AI Audit',
    desc: 'We diagnose what\'s blocking progress and chart a clear path forward. Fresh eyes and deep AI expertise to get things moving again.',
    services: ['Project Surgery', 'AI Audit'],
    cta: 'Get unstuck',
  },
  'other-need_hands': {
    title: 'AI Expert + AI Builds',
    desc: 'Experienced AI engineers who embed with your team. They ramp fast, ship real code, and transfer knowledge as they go.',
    services: ['AI Expert', 'AI Builds'],
    cta: 'Add AI talent',
  },
  'other-scaling': {
    title: 'AI Expert + AI Transformation',
    desc: 'Expert guidance to grow and optimise your AI operations. We embed senior talent and strategic advisory to help you scale.',
    services: ['AI Expert', 'AI Transformation'],
    cta: 'Scale with us',
  },
}

export default function FindYourFit() {
  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [resultLines, setResultLines] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Shared color cycle — skip gradient override (WebGL canvas handles visuals), keep terminal accents
  const labelRef = useColorCycle([terminalRef], { skipGradient: true })

  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.default })
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

  // Stagger result lines when step 2 is reached
  useEffect(() => {
    if (step !== 2) return
    // Track the recommendation shown
    if (selectedRole && selectedJourney) {
      const rec = recommendations[`${selectedRole}-${selectedJourney}`]
      posthog.capture('finder_recommendation_shown', {
        role: roles.find(r => r.id === selectedRole)?.label,
        role_id: selectedRole,
        journey: journeys.find(j => j.id === selectedJourney)?.label,
        journey_id: selectedJourney,
        recommendation: rec?.title,
        services: rec?.services,
      })
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => setResultLines(i), 400 + i * 150))
    }
    return () => timers.forEach(t => clearTimeout(t))
  }, [step, selectedRole, selectedJourney])

  // Typing effect — returns a promise that resolves when typing completes
  const typeText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typingRef.current) clearInterval(typingRef.current)
      setIsTyping(true)
      setTypedText('')
      let i = 0
      typingRef.current = setInterval(() => {
        i++
        setTypedText(text.slice(0, i))
        if (i >= text.length) {
          if (typingRef.current) clearInterval(typingRef.current)
          typingRef.current = null
          setIsTyping(false)
          resolve()
        }
      }, TYPING_SPEED)
    })
  }, [])

  // Cleanup typing on unmount
  useEffect(() => {
    return () => { if (typingRef.current) clearInterval(typingRef.current) }
  }, [])

  const animateTransition = useCallback((callback: () => void) => {
    const gsap = gsapRef.current
    const el = contentRef.current
    if (!gsap || !el) { callback(); return }

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
                onComplete: () => { el.style.minHeight = '' },
              }
            )
          })
        })
      },
    })
  }, [])

  const handleRoleSelect = useCallback(async (role: Role) => {
    const label = roles.find(r => r.id === role)?.label || role
    posthog.capture('finder_role_selected', { role: label, role_id: role })
    setSelectedRole(role)
    await typeText(label)
    await new Promise(r => setTimeout(r, 350))
    setTypedText('')
    animateTransition(() => setStep(1))
  }, [animateTransition, typeText])

  const handleJourneySelect = useCallback(async (journey: Journey) => {
    const label = journeys.find(j => j.id === journey)?.label || journey
    const roleLabel = roles.find(r => r.id === selectedRole)?.label || selectedRole
    posthog.capture('finder_journey_selected', {
      journey: label,
      journey_id: journey,
      role: roleLabel,
      role_id: selectedRole,
    })
    setSelectedJourney(journey)
    await typeText(label)
    await new Promise(r => setTimeout(r, 350))
    setTypedText('')
    setResultLines(0)
    animateTransition(() => setStep(2))
  }, [animateTransition, typeText, selectedRole])

  const handleReset = useCallback(() => {
    animateTransition(() => {
      setStep(0)
      setSelectedRole(null)
      setSelectedJourney(null)
      setTypedText('')
      setResultLines(0)
    })
  }, [animateTransition])

  const recommendation = selectedRole && selectedJourney
    ? recommendations[`${selectedRole}-${selectedJourney}`]
    : null

  return (
    <div className="exp-12-grid exp-12-grid--half exp-finder">
      {/* Left column — Unicorn Studio WebGL canvas + text overlay */}
      <div ref={labelRef} className="exp-col-label exp-col-label--gradient exp-col-label--top">
        {/* WebGL pixel gradient canvas — sits behind text */}
        <PixelGradientCanvas />
        {/* ASCII characters that appear with the shimmer sweep */}
        <FinderAsciiOverlay />
        {/* Text content — sits on top */}
        <div className="exp-col-label-content">
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
          <div className="exp-finder-progress" aria-hidden="true">
            <div className={`exp-finder-dot${step >= 0 ? ' exp-finder-dot--active' : ''}`} />
            <div className={`exp-finder-dot${step >= 1 ? ' exp-finder-dot--active' : ''}`} />
          </div>
        </div>
      </div>

      {/* Right column — terminal interface */}
      <div ref={contentRef} className="exp-col-content exp-finder-content" aria-live="polite">
        <div ref={terminalRef} className="exp-finder-terminal">
          {/* Terminal header bar */}
          <div className="exp-terminal-bar">
            <span className="exp-terminal-dot exp-terminal-dot--red" />
            <span className="exp-terminal-dot exp-terminal-dot--yellow" />
            <span className="exp-terminal-dot exp-terminal-dot--green" />
            <span className="exp-terminal-title">progression-labs://finder</span>
          </div>

          {/* Shared icon wrapper — all 3 SVGs always in DOM for crossfade */}
          <div style={{ marginBottom: 16 }}>
            <StepIcons step={step} />
          </div>

          {/* Step 0: Role selection */}
          {step === 0 && (
            <div className="exp-finder-step exp-finder-step--visible">
              <div className="exp-terminal-prompt">
                <span className="exp-terminal-caret">&gt;</span>
                <span className="exp-terminal-text">What&apos;s your role?</span>
                {!typedText && !isTyping && <span className="exp-terminal-cursor" />}
              </div>
              <div className="exp-terminal-keys">
                {roles.map(role => (
                  <button
                    key={role.id}
                    className="exp-terminal-key"
                    onClick={() => handleRoleSelect(role.id)}
                    disabled={isTyping}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              {typedText && (
                <div className="exp-terminal-typed">
                  <span className="exp-terminal-caret">&gt;</span> {typedText}
                  {isTyping && <span className="exp-terminal-cursor" />}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Journey selection */}
          {step === 1 && (
            <div className="exp-finder-step exp-finder-step--visible">
              <div className="exp-terminal-prompt">
                <span className="exp-terminal-caret">&gt;</span>
                <span className="exp-terminal-text">Where are you on your AI journey?</span>
                {!typedText && !isTyping && <span className="exp-terminal-cursor" />}
              </div>
              <div className="exp-terminal-keys">
                {journeys.map(j => (
                  <button
                    key={j.id}
                    className="exp-terminal-key"
                    onClick={() => handleJourneySelect(j.id)}
                    disabled={isTyping}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
              {typedText && (
                <div className="exp-terminal-typed">
                  <span className="exp-terminal-caret">&gt;</span> {typedText}
                  {isTyping && <span className="exp-terminal-cursor" />}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Result */}
          {step === 2 && recommendation && (
            <div className="exp-finder-step exp-finder-step--visible">
              <div className={`exp-terminal-line${resultLines >= 1 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-divider">
                  Analysis complete
                </div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 2 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-result-title">
                  {recommendation.title}
                </div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 3 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-result-desc">{recommendation.desc}</div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 4 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-result-tags">
                  {recommendation.services.map(s => (
                    <span key={s} className="exp-terminal-tag">{s}</span>
                  ))}
                </div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 5 ? ' exp-terminal-line--visible' : ''}`}>
                <a href={BRAINSTORM_HREF} onClick={(e) => {
                  posthog.capture('finder_cta_clicked', {
                    cta_text: recommendation.cta,
                    role: roles.find(r => r.id === selectedRole)?.label,
                    journey: journeys.find(j => j.id === selectedJourney)?.label,
                    recommendation: recommendation.title,
                  })
                  openBrainstormEmail(e)
                }} className="exp-btn-filled" style={{ marginTop: 16 }}>
                  {recommendation.cta} <ArrowIcon />
                </a>
              </div>
              <button className="exp-terminal-reset" onClick={() => {
                posthog.capture('finder_reset', {
                  role: roles.find(r => r.id === selectedRole)?.label,
                  journey: journeys.find(j => j.id === selectedJourney)?.label,
                })
                handleReset()
              }}>
                &gt; reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
