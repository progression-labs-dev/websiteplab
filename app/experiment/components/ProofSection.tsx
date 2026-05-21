'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { TESTIMONIALS } from '../data/siteContent'

const testimonials = TESTIMONIALS

export default function ProofSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-rotate testimonials every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDotClick = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Bidirectional scroll-blur reveal — the section starts blurred when
  // it's off-screen at the bottom, eases into focus as it enters the
  // viewport, holds sharp through the middle, then eases back into blur
  // as it exits the top. Mirrored when scrolling back up. Matches the
  // wonderful.ai-style "soft-focus" breathing.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    let ctx: { revert: () => void } | null = null

    const initGsap = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReduced) {
          gsap.set(el, { opacity: 1, filter: 'blur(0px)' })
          return
        }

        gsap.set(el, {
          opacity: 0.4,
          filter: 'blur(14px)',
          y: 40,
          willChange: 'filter, transform, opacity',
        })

        // Timeline mapped to the section's full traversal of the viewport.
        // Enter (0–35% of scroll range) → hold clear (35–65%) → exit (65–100%).
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })

        tl.to(el, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          ease: 'power2.out',
          duration: 0.35,
        }, 0)

        tl.to(el, {
          opacity: 0.4,
          filter: 'blur(14px)',
          y: -40,
          ease: 'power2.in',
          duration: 0.35,
        }, 0.65)
      }, el)
    }

    initGsap()

    return () => {
      ctx?.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} className="exp-section">
      {/* Testimonials — CSS Grid stack so height matches tallest card (zero layout shift) */}
      <div className="exp-proof-stage">
        <div className="exp-proof-grid">
          {testimonials.map((t, i) => {
            const isActive = i === activeIndex
            const hasSpotlight = Boolean(t.caseStudy)

            return (
              <div
                key={i}
                className={
                  hasSpotlight
                    ? 'exp-proof-card exp-proof-card--spotlight'
                    : 'exp-proof-card'
                }
                style={{
                  gridArea: '1 / 1',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                {hasSpotlight && t.caseStudy ? (
                  <div className="exp-proof-spotlight">
                    <div className="exp-proof-spotlight-quote">
                      <blockquote className="exp-quote">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>
                      <div className="exp-quote-author">
                        <strong>{t.author}</strong> &mdash; {t.role}
                      </div>
                    </div>
                    <div className="exp-proof-spotlight-media">
                      <video
                        className="exp-proof-video"
                        src={t.caseStudy.videoSrc}
                        poster={t.caseStudy.videoPoster}
                        controls
                        preload="none"
                        playsInline
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <blockquote className="exp-quote" style={{ margin: '0 auto' }}>
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="exp-quote-author">
                      <strong>{t.author}</strong> &mdash; {t.role}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Dots indicator — only shown when there's more than one testimonial */}
        {testimonials.length > 1 && (
          <div className="exp-proof-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={
                  i === activeIndex ? 'exp-proof-dot exp-proof-dot--active' : 'exp-proof-dot'
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
