'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import WavesCanvas from './WavesCanvas'
import ArrowIcon from './ArrowIcon'

export default function CTASection() {
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return

    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.set(el, { opacity: 0 })
        gsap.to(el, {
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        })
      }, el)
    }

    initGsap()

    return () => {
      ctx?.revert()
    }
  }, [])

  return (
    <>
      <section ref={ctaRef} className="exp-cta">
        <ScrollDecode
          text="Ready to build something extraordinary?"
          trigger="inView"
          tag="h2"
        />
        <p style={{ color: 'var(--exp-text-secondary)', marginBottom: 40, fontSize: 'var(--exp-body)' }}>
          Let&apos;s talk about what AI can do for your business.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <a href="mailto:hello@progressionlabs.com" className="exp-btn-filled">
            Request a brainstorm <ArrowIcon />
          </a>
          <a
            href="mailto:hello@progressionlabs.com"
            style={{
              color: 'var(--exp-text-secondary)',
              textDecoration: 'none',
              fontSize: 14,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
              e.currentTarget.style.color = 'var(--exp-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none'
              e.currentTarget.style.color = 'var(--exp-text-secondary)'
            }}
          >
            hello@progressionlabs.com
          </a>
        </div>
      </section>

      {/* Pre-footer: logo + copyright + social (Isidor .pre-footer) */}
      <div className="exp-pre-footer">
        <div className="exp-pre-footer-logo">
          <img
            src="/logo-white.png"
            alt="Progression Labs"
            style={{ height: 20, width: 'auto', opacity: 0.5 }}
          />
          <span>Progression Labs</span>
        </div>

        <div className="exp-pre-footer-copy">
          &copy; 2026 Progression Labs
        </div>

        <div className="exp-pre-footer-social">
          <a
            href="https://linkedin.com/company/progressionlabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>

      {/* Footer waves canvas (Isidor .footer with createWaves) */}
      <footer className="exp-footer">
        <WavesCanvas
          lineColor="rgba(255, 255, 255, 0.18)"
          waveAmp={25}
          waveSpeed={0.003}
          xGap={12}
          yGap={32}
          lineWidth={1}
          mouseInteraction={true}
          className="exp-footer-waves"
          style={{ width: '100%', height: '180px' }}
        />
      </footer>
    </>
  )
}
