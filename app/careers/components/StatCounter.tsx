'use client'

import { useEffect, useRef, useState } from 'react'

// Hero stat with a count-up on scroll-into-view. Non-numeric values (e.g.
// "London") render as-is. Respects prefers-reduced-motion.
export default function StatCounter({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const target = Number(value)
  const isNum = !Number.isNaN(target)
  // Initialise to the real value so it never flashes (or freezes on) 0; only
  // drop to 0 and animate up when motion is allowed and the element is in view.
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!isNum) return
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setDisplay(String(target)); return }
    setDisplay('0')

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const dur = 900
      let raf = 0
      let start = 0
      const tick = (t: number) => {
        if (!start) start = t
        const p = Math.min((t - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(String(Math.round(eased * target)))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [isNum, target])

  return (
    <div className="careers-hero-stat" ref={ref}>
      <div className="careers-hero-stat-num">{display}{suffix}</div>
      <div className="careers-hero-stat-label">{label}</div>
    </div>
  )
}
