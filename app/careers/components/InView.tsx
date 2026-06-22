'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

// Adds `is-in` to itself the first time it scrolls into view. Drives the CSS
// motion classes (cz-rev, cz-rule, cz-stagger). One-shot; respects reduced
// motion via the CSS guards.
export default function InView({
  as,
  className = '',
  style,
  delay = 0,
  threshold = 0.18,
  children,
  ...rest
}: {
  as?: ElementType
  className?: string
  style?: CSSProperties
  delay?: number
  threshold?: number
  children?: ReactNode
  [key: string]: unknown
}) {
  const Tag = (as || 'div') as ElementType
  const ref = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let io: IntersectionObserver | null = null
    // Measure after layout. Reveal anything already in/near the viewport (covers
    // above-the-fold and guards against a stuck-hidden state); observe the rest.
    const raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 0.95 || typeof IntersectionObserver === 'undefined') {
        setSeen(true)
        return
      }
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setSeen(true)
            io?.disconnect()
          }
        },
        { threshold, rootMargin: '0px 0px -6% 0px' },
      )
      io.observe(el)
    })
    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
    }
  }, [threshold])

  const merged = delay ? { transitionDelay: `${delay}ms`, ...style } : style
  return (
    <Tag ref={ref as never} className={`${className}${seen ? ' is-in' : ''}`} style={merged} {...rest}>
      {children}
    </Tag>
  )
}
