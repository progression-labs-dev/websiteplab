'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import type { ElementType } from 'react'

// Masked word-by-word rise (the Halfspace heading signature). Each word sits in
// an overflow-hidden mask and rises from below, staggered. Falls back to plain
// text under reduced motion (CSS guard). aria-label carries the full string.
export default function RevealText({
  text,
  as,
  className = '',
  delay = 0,
  step = 46,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  step?: number
}) {
  const Tag = (as || 'span') as ElementType
  const ref = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let io: IntersectionObserver | null = null
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
        { threshold: 0.25 },
      )
      io.observe(el)
    })
    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
    }
  }, [])

  const words = text.split(' ')
  return (
    <Tag ref={ref as never} className={`cz-rt ${className}${seen ? ' is-in' : ''}`} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="cz-rt-mask" aria-hidden="true">
            <span className="cz-rt-word" style={{ transitionDelay: `${delay + i * step}ms` }}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}
