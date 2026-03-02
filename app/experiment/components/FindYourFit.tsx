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

const TYPING_SPEED = 35 // ms per character

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
  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [resultLines, setResultLines] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.default })
  }, [])

  // Color cycling gradient — synced with hero
  // Also drives the terminal accent color via CSS custom property
  useEffect(() => {
    let raf: number
    const startTime = performance.now() / 1000

    const tick = () => {
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

      if (labelRef.current) {
        labelRef.current.style.backgroundImage = `linear-gradient(
          to bottom,
          rgba(${r}, ${g}, ${b}, 0.8) 0%,
          rgba(${r}, ${g}, ${b}, 0.5) 30%,
          rgba(${r}, ${g}, ${b}, 0.18) 65%,
          transparent 100%
        )`
      }

      if (terminalRef.current) {
        terminalRef.current.style.setProperty('--t-accent', `rgb(${r}, ${g}, ${b})`)
        terminalRef.current.style.setProperty('--t-accent-dim', `rgba(${r}, ${g}, ${b}, 0.12)`)
        terminalRef.current.style.setProperty('--t-accent-glow', `rgba(${r}, ${g}, ${b}, 0.2)`)
      }

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

  // Stagger result lines when step 2 is reached
  useEffect(() => {
    if (step !== 2) return
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => setResultLines(i), 400 + i * 150))
    }
    return () => timers.forEach(t => clearTimeout(t))
  }, [step])

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
    setSelectedRole(role)
    await typeText(label)
    await new Promise(r => setTimeout(r, 350))
    setTypedText('')
    animateTransition(() => setStep(1))
  }, [animateTransition, typeText])

  const handleJourneySelect = useCallback(async (journey: Journey) => {
    const label = journeys.find(j => j.id === journey)?.label || journey
    setSelectedJourney(journey)
    await typeText(label)
    await new Promise(r => setTimeout(r, 350))
    setTypedText('')
    setResultLines(0)
    animateTransition(() => setStep(2))
  }, [animateTransition, typeText])

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
      {/* Left column — label + gradient */}
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
        <div className="exp-finder-progress" aria-hidden="true">
          <div className={`exp-finder-dot${step >= 0 ? ' exp-finder-dot--active' : ''}`} />
          <div className={`exp-finder-dot${step >= 1 ? ' exp-finder-dot--active' : ''}`} />
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
                  ──────── ANALYSIS COMPLETE ────────
                </div>
              </div>
              <div className={`exp-terminal-line${resultLines >= 2 ? ' exp-terminal-line--visible' : ''}`}>
                <div className="exp-terminal-result-title">
                  <span className="exp-terminal-caret">&gt;</span> {recommendation.title}
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
                <a href="#contact" className="exp-btn-filled" style={{ marginTop: 16 }}>
                  {recommendation.cta} <ArrowIcon />
                </a>
              </div>
              <button className="exp-terminal-reset" onClick={handleReset}>
                &gt; reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
