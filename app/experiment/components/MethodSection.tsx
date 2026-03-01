'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import CardIcon from './CardIcon'
import ArrowIcon from './ArrowIcon'

const steps = [
  { id: '01', title: 'Discover', desc: 'We audit your systems, data, and goals to map the highest-impact AI opportunities. Every engagement starts with deep technical due diligence.', icon: 'discover' },
  { id: '02', title: 'Design', desc: 'We architect the solution: models, pipelines, interfaces, and integration points. Nothing ships without a clear blueprint approved by your team.', icon: 'design' },
  { id: '03', title: 'Build', desc: 'Our engineers develop, test, and iterate in tight cycles with your team embedded. Production-grade code, not prototypes.', icon: 'build' },
  { id: '04', title: 'Scale', desc: 'We deploy to production, monitor performance, and hand over with full documentation. You own everything we build.', icon: 'scale' },
]

export default function MethodSection() {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])

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
          stagger: 0.2,
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
      {/* Columns 1-6: Isidor-style vivid gradient sticky label */}
      <div className="exp-col-label exp-col-label--gradient">
        <div className="exp-tag">Enterprise</div>
        <ScrollDecode
          text="Our Method"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
        <p className="exp-label-desc">
          A proven four-phase approach that transforms AI ambition into production-grade reality.
        </p>
        <a href="#contact" className="exp-btn-outline" style={{ alignSelf: 'flex-start' }}>
          Contact us <ArrowIcon />
        </a>
      </div>

      {/* Columns 7-12: Content panels with SVG icons + L-bracket corners */}
      <div className="exp-col-content">
        {steps.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => { panelRefs.current[i] = el }}
            className="exp-panel"
          >
            <CardIcon name={step.icon} />
            <div className="exp-panel-id">{step.id}</div>
            <div className="exp-panel-title">{step.title}</div>
            <div className="exp-panel-desc">{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
