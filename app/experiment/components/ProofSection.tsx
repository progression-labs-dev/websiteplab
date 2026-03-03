'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const testimonials = [
  {
    quote: "They've gone beyond just a number of engineers that I'm outsourcing AI for. They truly have been a thought partner, someone that's been very dependable and someone who helped us shape our strategy.",
    author: 'Dipak Patel',
    role: 'CEO of Globo',
    videoId: 'dQw4w9WgXcQ', // TODO: replace with real video ID
  },
  {
    quote: 'Progression Labs transformed our approach to AI implementation. Their team delivered beyond our expectations and helped us achieve results we didn\'t think were possible.',
    author: 'Sarah Chen',
    role: 'CTO of TechVentures',
    videoId: 'dQw4w9WgXcQ', // TODO: replace with real video ID
  },
  {
    quote: 'Working with Progression Labs has been a game-changer. They brought deep expertise and a collaborative approach that made all the difference in our AI journey.',
    author: 'Michael Roberts',
    role: 'VP Engineering at DataFlow',
    videoId: 'dQw4w9WgXcQ', // TODO: replace with real video ID
  },
]

export default function ProofSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Auto-rotate testimonials every 5s — paused when a video is expanded
  useEffect(() => {
    if (expandedIndex !== null) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [expandedIndex])

  const handleLearnMore = useCallback((index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
    }
  }, [expandedIndex])

  const handleDotClick = useCallback((index: number) => {
    setActiveIndex(index)
    setExpandedIndex(null)
  }, [])

  // GSAP ScrollTrigger fade-up entrance
  useEffect(() => {
    const el = sectionRef.current
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
    <section ref={sectionRef} className="exp-section">
      {/* Testimonials — CSS Grid stack so height matches tallest quote (zero layout shift) */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'grid' }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                gridArea: '1 / 1',
                opacity: i === activeIndex ? 1 : 0,
                transition: 'opacity 0.5s ease',
                pointerEvents: i === activeIndex ? 'auto' : 'none',
              }}
            >
              <blockquote className="exp-quote" style={{ margin: '0 auto' }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="exp-quote-author">
                <strong>{t.author}</strong> &mdash; {t.role}
              </div>

              {/* Learn more button */}
              <button
                className="exp-proof-learn-more"
                onClick={() => handleLearnMore(i)}
                aria-expanded={expandedIndex === i}
              >
                {expandedIndex === i ? 'Close' : 'Learn more'}
                <svg
                  className={`exp-proof-chevron${expandedIndex === i ? ' exp-proof-chevron--open' : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Expandable video section */}
              <div
                className={`exp-proof-video-wrap${expandedIndex === i ? ' exp-proof-video-wrap--open' : ''}`}
              >
                <div className="exp-proof-video-inner">
                  {expandedIndex === i && (
                    <iframe
                      className="exp-proof-video"
                      src={`https://www.youtube.com/embed/${t.videoId}?rel=0`}
                      title={`${t.author} testimonial video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              aria-label={`Show testimonial ${i + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                background: i === activeIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
