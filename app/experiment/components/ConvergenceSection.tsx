'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import ArrowIcon from './ArrowIcon'

const commitments = [
  {
    id: '01',
    title: 'Transparent Pricing',
    desc: 'Fixed-scope, fixed-price engagements. No surprise invoices, no ballooning timelines. You know exactly what you\'re paying before we start.',
  },
  {
    id: '02',
    title: 'Weekly Proof of Progress',
    desc: 'Every Friday you get a working demo, not a slide deck. If you can\'t see it running, we haven\'t made progress.',
  },
  {
    id: '03',
    title: 'Built to Last After We Leave',
    desc: 'We write production code your team can maintain. Full documentation, knowledge transfer sessions, and zero vendor lock-in.',
  },
  {
    id: '04',
    title: 'Your People, Upgraded',
    desc: 'We don\'t just build — we upskill. Your engineers pair with ours so capability stays in-house long after the engagement ends.',
  },
  {
    id: '05',
    title: 'Outcome-Aligned Incentives',
    desc: 'We tie a portion of our fee to measurable outcomes. If the project doesn\'t hit agreed KPIs, we share the downside.',
  },
]

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

export default function ConvergenceSection() {
  const labelRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])

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

  // GSAP ScrollTrigger stagger reveal
  useEffect(() => {
    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const validRefs = panelRefs.current.filter(Boolean) as HTMLDivElement[]
      if (validRefs.length === 0) return

      ctx = gsap.context(() => {
        gsap.set(validRefs, { y: 60, opacity: 0 })
        gsap.to(validRefs, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: validRefs[0],
            start: 'top 85%',
            once: true,
          },
        })
      })
    }

    initGsap()
    return () => { ctx?.revert() }
  }, [])

  return (
    <div className="exp-12-grid exp-12-grid--half">
      {/* Left column: Sticky label with gradient */}
      <div ref={labelRef} className="exp-col-label exp-col-label--gradient">
        <div className="exp-tag">Commitment</div>
        <ScrollDecode
          text="How We Ensure Progression"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
        <p className="exp-label-desc">
          Five promises that define every engagement. No exceptions.
        </p>
        <a href="#contact" className="exp-btn-outline" style={{ alignSelf: 'flex-start' }}>
          Contact us <ArrowIcon />
        </a>
      </div>

      {/* Right column: Commitment cards */}
      <div className="exp-col-content">
        {commitments.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => { panelRefs.current[i] = el }}
            className="exp-panel"
          >
            <div className="exp-panel-id">{item.id}</div>
            <div className="exp-panel-title">{item.title}</div>
            <div className="exp-panel-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
