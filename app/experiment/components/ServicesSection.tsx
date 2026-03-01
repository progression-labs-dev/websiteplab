'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import CardIcon from './CardIcon'
import ArrowIcon from './ArrowIcon'

const services = [
  { id: '01', title: 'AI Expert', desc: 'On-demand access to senior AI engineers and strategists. We embed within your team to architect, build, and ship production AI \u2014 from LLM fine-tuning to agent orchestration.', icon: 'expert' },
  { id: '02', title: 'AI Builds', desc: 'Full-stack AI product development from zero to production. Custom models, data pipelines, APIs, and interfaces \u2014 delivered as working software with ongoing support.', icon: 'builds' },
  { id: '03', title: 'AI Transformation', desc: 'Strategic advisory for enterprise AI adoption. We assess, plan, and guide your organization through digital transformation \u2014 from roadmapping to change management.', icon: 'transform' },
  { id: '04', title: 'AI Audit', desc: 'Deep-dive assessment of your AI readiness, current systems, and opportunities. We identify gaps, risks, and quick wins \u2014 delivering a prioritised roadmap in weeks, not months.', icon: 'audit' },
  { id: '05', title: 'Project Surgery', desc: 'When AI projects stall, we diagnose and fix. Our team parachutes in to rescue troubled implementations \u2014 refactoring models, fixing pipelines, and getting your project back on track.', icon: 'surgery' },
  { id: '06', title: 'Ideation Sessions', desc: 'Structured workshops that turn business challenges into AI-powered solutions. We facilitate brainstorms with your team, prototype concepts live, and leave you with a concrete action plan.', icon: 'ideation' },
]

export default function ServicesSection() {
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
        <div className="exp-tag">Services</div>
        <ScrollDecode
          text="What We Do"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
        <p className="exp-label-desc">
          End-to-end AI consulting, from strategic advisory through to production deployment.
        </p>
        <a href="#contact" className="exp-btn-outline" style={{ alignSelf: 'flex-start' }}>
          Contact us <ArrowIcon />
        </a>
      </div>

      {/* Columns 7-12: Content panels with SVG icons + L-bracket corners */}
      <div className="exp-col-content">
        {services.map((svc, i) => (
          <div
            key={svc.id}
            ref={(el) => { panelRefs.current[i] = el }}
            className="exp-panel"
          >
            <CardIcon name={svc.icon} />
            <div className="exp-panel-id">{svc.id}</div>
            <div className="exp-panel-title">{svc.title}</div>
            <div className="exp-panel-desc">{svc.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
