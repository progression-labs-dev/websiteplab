'use client'

import { useEffect, useRef, useState } from 'react'

// The signature "smallness as a flex" data moment. Bars animate in on scroll.
// Same outcome, a fraction of the headcount — small bar (us) wins.
const ROWS = [
  { name: 'Progression Labs', value: '~8 people', width: 16, accent: true },
  { name: 'Typical delivery org', value: '50+ people', width: 100, accent: false },
]

export default function SmallnessChart() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="careers-chart" ref={ref}>
      <p className="careers-chart-label">People to ship the same outcome</p>
      <div className="careers-chart-rows">
        {ROWS.map((r) => (
          <div className={`careers-chart-row${inView ? ' is-in' : ''}`} key={r.name}>
            <div className="careers-chart-row-head">
              <span className="careers-chart-name">{r.name}</span>
              <span className="careers-chart-value">{r.value}</span>
            </div>
            <div className="careers-chart-track">
              <div
                className={`careers-chart-bar${r.accent ? ' is-accent' : ''}`}
                style={{ ['--cz-bar-w' as string]: `${r.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="careers-chart-caption">
        Same outcome, <strong>a fraction of the headcount.</strong> Senior people plus AI leverage,
        not layers.
      </p>
    </div>
  )
}
