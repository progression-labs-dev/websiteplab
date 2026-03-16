'use client'

import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'

/**
 * Automatic PostHog event tracking:
 * 1. Button clicks — captures button text + section
 * 2. Outbound link clicks — descriptive event names
 * 3. Section visibility — tracks time spent in each section
 */
export default function PostHogTracker() {
  const sectionTimers = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    // ─── CLICK TRACKING (buttons + links) ───
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Find closest button or anchor
      const button = target.closest('button')
      const anchor = target.closest('a')

      if (button) {
        const text = button.textContent?.trim() || 'unknown'
        const section = button.closest('section')?.id || button.closest('[class*="exp-"]')?.className.split(' ')[0] || 'unknown'
        posthog.capture('button_clicked', {
          button_text: text,
          section,
        })
      }

      if (anchor) {
        const href = anchor.getAttribute('href') || ''
        const text = anchor.textContent?.trim() || 'unknown'
        const section = anchor.closest('section')?.id || anchor.closest('footer')?.tagName.toLowerCase() || 'unknown'

        // Outbound links
        if (href.startsWith('http') && !href.includes('progressionlabs.com')) {
          // Gmail brainstorm CTA
          if (href.includes('mail.google.com')) {
            posthog.capture('brainstorm_cta_clicked', {
              link_text: text,
              section,
            })
          }
          // LinkedIn
          else if (href.includes('linkedin.com')) {
            posthog.capture('linkedin_clicked', {
              section,
            })
          }
          // Other outbound
          else {
            posthog.capture('outbound_link_clicked', {
              link_text: text,
              url: href,
              section,
            })
          }
        }

        // Internal nav links
        else if (href.startsWith('#')) {
          posthog.capture('nav_link_clicked', {
            link_text: text,
            target: href,
          })
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    // ─── SECTION VISIBILITY TRACKING ───
    const sections = document.querySelectorAll('section[id], .exp-cta, .exp-logo-carousel')
    const observers: IntersectionObserver[] = []

    sections.forEach((section) => {
      const id = section.id || section.className.split(' ')[0]

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Section entered viewport
            sectionTimers.current.set(id, Date.now())
            posthog.capture('section_viewed', { section: id })
          } else {
            // Section left viewport — calculate time spent
            const startTime = sectionTimers.current.get(id)
            if (startTime) {
              const seconds = Math.round((Date.now() - startTime) / 1000)
              if (seconds >= 2) {
                posthog.capture('section_time_spent', {
                  section: id,
                  seconds,
                })
              }
              sectionTimers.current.delete(id)
            }
          }
        },
        { threshold: 0.3 }
      )

      observer.observe(section)
      observers.push(observer)
    })

    return () => {
      document.removeEventListener('click', handleClick, true)
      observers.forEach((o) => o.disconnect())
    }
  }, [])

  return null
}
