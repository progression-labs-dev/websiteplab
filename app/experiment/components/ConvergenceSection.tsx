'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import CardIcon from './CardIcon'
import ArrowIcon from './ArrowIcon'
import { useColorCycle } from './useColorCycle'

const commitments = [
  {
    id: '01',
    title: 'Proven success, every time',
    desc: 'A playbook tested across industries. Senior engineers who\'ve done this before. Every engagement follows a methodology refined over dozens of deployments.',
    icon: 'scale',
  },
  {
    id: '02',
    title: 'If it doesn\'t fit, we don\'t build it',
    desc: 'We audit first and filter ruthlessly. Every engagement starts with a deep-dive assessment. If a use case doesn\'t pass our viability bar, you\'ll know before a line of code is written.',
    icon: 'audit',
  },
  {
    id: '03',
    title: 'Built to last after we leave',
    desc: 'Documentation, training, and a named owner on your team. Your independence is our success metric. We design ourselves out of the job.',
    icon: 'build',
  },
  {
    id: '04',
    title: 'Your people, upgraded',
    desc: 'Your engineers learn production AI patterns that stay long after we leave. We pair with your team daily, run workshops, and leave behind codified patterns and playbooks.',
    icon: 'expert',
  },
  {
    id: '05',
    title: 'Your success is our success',
    desc: 'We don\'t just deliver and walk away. We stay accountable to results, measuring impact and iterating until the value is proven.',
    icon: 'transform',
  },
]

export default function ConvergenceSection() {
  const labelRef = useColorCycle()
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])

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
            <CardIcon name={item.icon} />
            <div className="exp-panel-id">{item.id}</div>
            <div className="exp-panel-title">{item.title}</div>
            <div className="exp-panel-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
