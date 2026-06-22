'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface CareersSectionProps {
  id?: string
  tone?: 'light' | 'dark'
  /** Bone panel background (rhythm without photos). */
  panel?: boolean
  /** Scroll reveal (one-shot fade + rise). Default on. */
  blur?: boolean
  eyebrow?: string
  heading?: string
  intro?: string
  children?: ReactNode
}

/**
 * CareersSection — full-bleed section shell for the careers page.
 *
 * - `tone="dark"` flips the section to the black/white palette (data-theme),
 *   so the page reads as alternating white → black bands like the main site.
 * - When `blur` is on, applies the site's signature bidirectional scroll-blur
 *   reveal (blur 22px → sharp through the middle → re-blur on exit). The GSAP
 *   timeline is copied from app/experiment/components/ProofSection.tsx.
 */
export default function CareersSection({
  id,
  tone = 'light',
  panel = false,
  blur = true,
  eyebrow,
  heading,
  intro,
  children,
}: CareersSectionProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!blur) return
    const el = ref.current
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

        // Restrained one-shot fade-up reveal (Northslope-calm): rise + fade in
        // once as the section enters, then stay put — no scroll-tied re-blur.
        gsap.set(el, {
          opacity: 0,
          y: 28,
          willChange: 'transform, opacity',
        })

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        })
      }, el)
    }

    initGsap()
    return () => { ctx?.revert() }
  }, [blur])

  return (
    <section
      ref={ref}
      id={id}
      className="careers-section"
      data-tone={tone}
      data-theme={tone === 'dark' ? 'dark' : 'light'}
      data-panel={panel ? 'true' : undefined}
    >
      <div className="careers-inner">
        {eyebrow && <p className="careers-eyebrow">{eyebrow}</p>}
        {heading && <h2 className="careers-heading">{heading}</h2>}
        {intro && <p className="careers-intro">{intro}</p>}
        {children}
      </div>
    </section>
  )
}
