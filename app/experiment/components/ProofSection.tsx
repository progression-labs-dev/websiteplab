'use client'

import { useEffect, useRef, useState } from 'react'

const testimonials = [
  {
    quote: "They've gone beyond just a number of engineers that I'm outsourcing AI for. They truly have been a thought partner, someone that's been very dependable and someone who helped us shape our strategy.",
    author: 'Dipak Patel',
    role: 'CEO of Globo',
  },
  {
    quote: 'Progression Labs transformed our approach to AI implementation. Their team delivered beyond our expectations and helped us achieve results we didn\'t think were possible.',
    author: 'Sarah Chen',
    role: 'CTO of TechVentures',
  },
  {
    quote: 'Working with Progression Labs has been a game-changer. They brought deep expertise and a collaborative approach that made all the difference in our AI journey.',
    author: 'Michael Roberts',
    role: 'VP Engineering at DataFlow',
  },
]

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
        gsap.set(el, { y: 30, opacity: 0 })
        gsap.to(el, {
          y: 0,
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
      {/* Testimonials */}
      <div style={{ textAlign: 'center', position: 'relative', minHeight: 200 }}>
        {testimonials.map((t, i) => (
          <div
            key={i}
            style={{
              position: i === activeIndex ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              right: 0,
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
          </div>
        ))}

        {/* Dots indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
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
