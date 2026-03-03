'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ScrollDecode from './ScrollDecode'
import CardIcon from './CardIcon'
import GradientLottie from './GradientLottie'
import ArrowIcon from './ArrowIcon'

// --- Data ---

type JourneyStage = 'exploring' | 'building' | 'scaling'

interface Service {
  id: string
  title: string
  desc: string
  shortDesc: string
  icon: string
}

interface JourneyConfig {
  id: JourneyStage
  phase: string
  label: string
  tagline: string
  coreServiceId: string
  supportingServiceIds: string[]
}

const services: Service[] = [
  {
    id: '01', title: 'AI Expert', icon: 'expert',
    desc: 'On-demand access to senior AI engineers and strategists. We embed within your team to architect, build, and ship production AI — from LLM fine-tuning to agent orchestration.',
    shortDesc: 'Senior AI engineers embedded in your team.',
  },
  {
    id: '02', title: 'AI Builds', icon: 'builds',
    desc: 'Full-stack AI product development from zero to production. Custom models, data pipelines, APIs, and interfaces — delivered as working software with ongoing support.',
    shortDesc: 'Full-stack AI product development, zero to production.',
  },
  {
    id: '03', title: 'AI Transformation', icon: 'transform',
    desc: 'Strategic advisory for enterprise AI adoption. We assess, plan, and guide your organization through digital transformation — from roadmapping to change management.',
    shortDesc: 'Strategic advisory for enterprise AI adoption.',
  },
  {
    id: '04', title: 'AI Audit', icon: 'audit',
    desc: 'Deep-dive assessment of your AI readiness, current systems, and opportunities. We identify gaps, risks, and quick wins — delivering a prioritised roadmap in weeks, not months.',
    shortDesc: 'AI readiness assessment with a prioritised roadmap.',
  },
  {
    id: '05', title: 'Project Surgery', icon: 'surgery',
    desc: 'When AI projects stall, we diagnose and fix. Our team parachutes in to rescue troubled implementations — refactoring models, fixing pipelines, and getting your project back on track.',
    shortDesc: 'Rescue and fix stalled AI implementations.',
  },
  {
    id: '06', title: 'Ideation Sessions', icon: 'ideation',
    desc: 'Structured workshops that turn business challenges into AI-powered solutions. We facilitate brainstorms with your team, prototype concepts live, and leave you with a concrete action plan.',
    shortDesc: 'Workshops that turn challenges into AI solutions.',
  },
]

const journeys: JourneyConfig[] = [
  {
    id: 'exploring', phase: 'PHASE_01', label: 'Exploring',
    tagline: 'Find your AI starting point',
    coreServiceId: '03', // AI Transformation
    supportingServiceIds: ['04', '06'], // AI Audit, Ideation Sessions
  },
  {
    id: 'building', phase: 'PHASE_02', label: 'Building',
    tagline: 'Turn strategy into production software',
    coreServiceId: '02', // AI Builds
    supportingServiceIds: ['01', '05'], // AI Expert, Project Surgery
  },
  {
    id: 'scaling', phase: 'PHASE_03', label: 'Scaling',
    tagline: 'Grow and optimise your AI operations',
    coreServiceId: '01', // AI Expert
    supportingServiceIds: ['03', '04'], // AI Transformation, AI Audit
  },
]

function getServiceOrder(stage: JourneyStage) {
  const config = journeys.find(j => j.id === stage)!
  const hero = services.find(s => s.id === config.coreServiceId)!
  const supporting = config.supportingServiceIds.map(id => services.find(s => s.id === id)!)
  const usedIds = new Set([config.coreServiceId, ...config.supportingServiceIds])
  const others = services.filter(s => !usedIds.has(s.id))
  return { hero, supporting, others }
}

// --- Brand palette (synced with hero shader) ---

const BRAND_COLORS: [number, number, number][] = [
  [186, 85, 211],   // #BA55D3 Medium Orchid
  [255, 160, 122],  // #FFA07A Light Salmon
  [185, 233, 121],  // #B9E979 Progression Green
  [64, 224, 208],   // #40E0D0 Turquoise
  [0, 0, 255],      // #0000FF Blue
]
const CYCLE_SEC = 30
function ssmooth(t: number) { return t * t * (3 - 2 * t) }

// --- Binary scramble for tagline transitions ---

const SCRAMBLE_CHARS = '01'
function scrambleText(text: string): string {
  return text.split('').map(c =>
    c === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * 2)]
  ).join('')
}

// --- Component ---

export default function ServicesSection() {
  const [activeStage, setActiveStage] = useState<JourneyStage>('exploring')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const labelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)
  const hasRenderedOnce = useRef(false)
  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null)
  const currentColorRef = useRef({ r: 0, g: 0, b: 255 })

  // Load GSAP once
  useEffect(() => {
    import('gsap').then(mod => { gsapRef.current = mod.default })
  }, [])

  // Color cycling — synced with hero gradient (same 30s cycle, same smoothstep)
  // Extended to also set --journey-accent CSS var on the pill selector
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

      currentColorRef.current = { r, g, b }

      labelRef.current.style.backgroundImage = `linear-gradient(
        to bottom,
        rgba(${r}, ${g}, ${b}, 0.8) 0%,
        rgba(${r}, ${g}, ${b}, 0.5) 30%,
        rgba(${r}, ${g}, ${b}, 0.18) 65%,
        transparent 100%
      )`

      // Set accent color on pills container
      if (pillsRef.current) {
        pillsRef.current.style.setProperty('--journey-accent', `rgb(${r}, ${g}, ${b})`)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ScrollTrigger initial reveal
  useEffect(() => {
    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const contentEl = contentRef.current
      if (!contentEl) return

      const panels = contentEl.querySelectorAll('.exp-service-hero, .exp-supporting-card, .exp-compact-item')
      if (panels.length === 0) return

      ctx = gsap.context(() => {
        gsap.set(panels, { y: 60, opacity: 0 })
        gsap.to(panels, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentEl,
            start: 'top 85%',
            once: true,
          },
          onComplete: () => { hasRenderedOnce.current = true },
        })
      })
    }

    initGsap()
    return () => { ctx?.revert() }
  }, [])

  // Binary scramble tagline transition
  const scrambleTagline = useCallback((newText: string) => {
    const el = taglineRef.current
    if (!el) return

    let frame = 0
    const totalFrames = 5 // ~300ms at 60ms intervals
    const interval = setInterval(() => {
      frame++
      if (frame >= totalFrames) {
        clearInterval(interval)
        el.textContent = newText
      } else {
        el.textContent = scrambleText(newText)
      }
    }, 60)
  }, [])

  // Stage change handler with GSAP transition
  const handleStageChange = useCallback((stage: JourneyStage) => {
    if (stage === activeStage) return

    const gsap = gsapRef.current
    const contentEl = contentRef.current
    if (!gsap || !contentEl) {
      setActiveStage(stage)
      return
    }

    const journey = journeys.find(j => j.id === stage)!

    // Scramble tagline immediately
    scrambleTagline(journey.tagline)

    // Fade out current content
    const currentPanels = contentEl.querySelectorAll('.exp-service-hero, .exp-supporting-card, .exp-compact-item')
    gsap.to(currentPanels, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        // Update state (triggers re-render)
        setActiveStage(stage)
        setExpandedId(null)

        // After React re-renders, stagger fade in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const newPanels = contentEl.querySelectorAll('.exp-service-hero, .exp-supporting-card, .exp-compact-item')
            gsap.fromTo(newPanels,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
            )
          })
        })
      },
    })
  }, [activeStage, scrambleTagline])

  const activeJourney = journeys.find(j => j.id === activeStage)!
  const { hero, supporting, others } = getServiceOrder(activeStage)

  return (
    <div className="exp-12-grid exp-12-grid--half">
      {/* Columns 1-6: Sticky label with journey selector */}
      <div ref={labelRef} className="exp-col-label exp-col-label--gradient">
        <div className="exp-tag">Services</div>
        <ScrollDecode
          text="What We Do"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
        <p ref={taglineRef} className="exp-label-desc">
          {activeJourney.tagline}
        </p>

        {/* Journey selector pills */}
        <div ref={pillsRef} className="exp-journey-selector">
          {journeys.map(j => (
            <button
              key={j.id}
              className={`exp-journey-pill${activeStage === j.id ? ' exp-journey-pill--active' : ''}`}
              onClick={() => handleStageChange(j.id)}
            >
              <span className="exp-journey-pill-phase">{j.phase}</span>
              <span className="exp-journey-pill-label">{j.label}</span>
            </button>
          ))}
        </div>

        <a href="#contact" className="exp-btn-outline" style={{ alignSelf: 'flex-start' }}>
          Contact us <ArrowIcon />
        </a>
      </div>

      {/* Columns 7-12: Restructured per active stage */}
      <div ref={contentRef} className="exp-col-content exp-col-content--journey">

        {/* Hero service panel (core service) */}
        <div className="exp-service-hero exp-panel">
          <CardIcon name={hero.icon} />
          <div className="exp-panel-id">{hero.id}</div>
          <div className="exp-service-hero-badge">Core</div>
          <div className="exp-panel-title">{hero.title}</div>
          <div className="exp-panel-desc">{hero.desc}</div>
        </div>

        {/* Thin divider */}
        <div className="exp-service-divider" />

        {/* Supporting services — 2-column row */}
        <div className="exp-supporting-row">
          {supporting.map(svc => (
            <div key={svc.id} className="exp-supporting-card exp-panel">
              <div className="exp-supporting-icon">
                <GradientLottie src={`/lottie/service-${svc.icon}.json`} size={48} />
              </div>
              <div className="exp-panel-id">{svc.id}</div>
              <div className="exp-panel-title">{svc.title}</div>
              <div className="exp-panel-desc">{svc.shortDesc}</div>
            </div>
          ))}
        </div>

        {/* Thin divider */}
        <div className="exp-service-divider" />

        {/* Compact accordion list (remaining 3 services) */}
        <div className="exp-compact-list">
          {others.map(svc => (
            <div
              key={svc.id}
              className={`exp-compact-item${expandedId === svc.id ? ' exp-compact-item--expanded' : ''}`}
            >
              <button
                className="exp-compact-header"
                onClick={() => setExpandedId(expandedId === svc.id ? null : svc.id)}
              >
                <div className="exp-compact-icon">
                  <GradientLottie src={`/lottie/service-${svc.icon}.json`} size={32} />
                </div>
                <span className="exp-compact-title">{svc.title}</span>
                <span className="exp-compact-chevron">▸</span>
              </button>
              {expandedId === svc.id && (
                <div className="exp-compact-body">
                  <p>{svc.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
