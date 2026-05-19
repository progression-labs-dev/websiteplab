'use client'

import { useEffect, useRef } from 'react'
import ScrollDecode from './ScrollDecode'
import ArrowIcon from './ArrowIcon'
import FooterGradient from './FooterGradientText'
import { BRAINSTORM_HREF, openBrainstormEmail } from './brainstormMailto'

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
          <a href={BRAINSTORM_HREF} onClick={openBrainstormEmail} className="exp-btn-filled">
            Request a brainstorm <ArrowIcon />
          </a>
          <a
            href={BRAINSTORM_HREF}
            onClick={openBrainstormEmail}
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
            gabor.soter@progressionlabs.com
          </a>
        </div>
      </section>

      {/* Footer — gradient atmosphere fading up from bottom */}
      <footer className="exp-footer">
        <FooterGradient />

        {/* Pre-footer info — sits above the gradient */}
        <div className="exp-pre-footer">
          <div className="exp-pre-footer-logo">
            <span
              role="img"
              aria-label="Progression Labs"
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                backgroundColor: 'var(--exp-text-primary)',
                WebkitMaskImage: 'url(/logo-white.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo-white.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
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
              aria-label="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

      </footer>
    </>
  )
}
