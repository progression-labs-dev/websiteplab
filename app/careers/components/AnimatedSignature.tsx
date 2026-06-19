'use client'

import { useRef, useEffect, useState } from 'react'

// Animated signature: the name (in a script font) is "written" left-to-right
// on scroll-into-view via a clip-path reveal, with a small pen nib travelling
// along the leading edge. Respects prefers-reduced-motion (shows fully drawn).
export default function AnimatedSignature({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setDrawn(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <span ref={ref} className={`careers-sig${drawn ? ' is-drawn' : ''}`} aria-label={name}>
      <span className="careers-sig-ink" aria-hidden="true">
        {name}
      </span>
      <span className="careers-sig-pen" aria-hidden="true" />
    </span>
  )
}
