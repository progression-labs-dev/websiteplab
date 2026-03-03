'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import PanelCorners from './PanelCorners'
import ArrowIcon from './ArrowIcon'

interface ServiceDetail {
  icon: string
  title: string
  description: string
  bullets: string[]
}

const mainServices: ServiceDetail[] = [
  {
    icon: 'expert',
    title: 'AI Expert',
    description:
      'On-demand access to senior AI engineers and strategists. We embed within your team to architect, build, and ship production AI.',
    bullets: [
      'LLM fine-tuning & prompt engineering',
      'Agent orchestration & tool integration',
      'Architecture reviews & best practices',
      'Hands-on pair programming with your team',
    ],
  },
  {
    icon: 'builds',
    title: 'AI Builds',
    description:
      'Full-stack AI product development from zero to production. Custom models, data pipelines, APIs, and interfaces.',
    bullets: [
      'End-to-end product development',
      'Custom model training & deployment',
      'Data pipeline architecture',
      'Production-grade APIs & interfaces',
    ],
  },
  {
    icon: 'transform',
    title: 'AI Transformation',
    description:
      'Strategic advisory for enterprise AI adoption. We assess, plan, and guide your organization through digital transformation.',
    bullets: [
      'AI readiness assessment',
      'Roadmapping & prioritisation',
      'Change management & training',
      'ROI measurement & optimisation',
    ],
  },
]

const supportingServices: ServiceDetail[] = [
  {
    icon: 'audit',
    title: 'AI Audit',
    description:
      'Deep-dive assessment of your AI readiness, current systems, and opportunities. Prioritised roadmap in weeks.',
    bullets: [
      'Technical infrastructure review',
      'Data quality & governance audit',
      'Risk & compliance assessment',
    ],
  },
  {
    icon: 'surgery',
    title: 'Project Surgery',
    description:
      'When AI projects stall, we diagnose and fix. Our team parachutes in to rescue troubled implementations.',
    bullets: [
      'Root cause diagnosis',
      'Model & pipeline refactoring',
      'Performance optimisation',
    ],
  },
  {
    icon: 'ideation',
    title: 'Ideation Sessions',
    description:
      'Structured workshops that turn business challenges into AI-powered solutions with a concrete action plan.',
    bullets: [
      'Facilitated brainstorming',
      'Live concept prototyping',
      'Prioritised action plan',
    ],
  },
]

export default function ServiceDetailSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const el = sectionRef.current
      if (!el) return

      const cards = el.querySelectorAll('.exp-detail-card')
      if (cards.length === 0) return

      ctx = gsap.context(() => {
        gsap.set(cards, { opacity: 0 })
        gsap.to(cards, {
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
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

  return (
    <div ref={sectionRef} className="exp-detail-section">
      <div className="exp-detail-header">
        <div className="exp-tag">Services</div>
        <ScrollDecode
          text="From the Toolkit"
          trigger="inView"
          tag="h2"
          className="exp-section-heading"
          duration={800}
        />
        <p className="exp-detail-subtitle">
          Six services, one goal — make AI work for your business.
        </p>
      </div>

      {/* Main services — large cards */}
      <div className="exp-detail-grid exp-detail-grid--main">
        {mainServices.map((svc, i) => (
          <div key={svc.title} className="exp-detail-card">
            <PanelCorners />
            <div className="exp-detail-card-num">{String(i + 1).padStart(2, '0')}</div>
            <div className="exp-detail-card-title">{svc.title}</div>
            <div className="exp-detail-card-desc">{svc.description}</div>
            <ul className="exp-detail-bullets">
              {svc.bullets.map((b) => (
                <li key={b}>
                  <span className="exp-detail-bullet-plus">+</span> {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Supporting services — smaller cards */}
      <div className="exp-detail-grid exp-detail-grid--supporting">
        {supportingServices.map((svc, i) => (
          <div key={svc.title} className="exp-detail-card exp-detail-card--small">
            <PanelCorners />
            <div className="exp-detail-card-num">{String(i + 4).padStart(2, '0')}</div>
            <div className="exp-detail-card-title">{svc.title}</div>
            <div className="exp-detail-card-desc">{svc.description}</div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="exp-detail-cta">
        <a href="#contact" className="exp-btn-outline">
          Let&apos;s talk <ArrowIcon />
        </a>
      </div>
    </div>
  )
}
