'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { WHY_PL } from '../data/careersContent'

// Replaces the static value grid with a rotating carousel: one value at a time,
// auto-advancing, with arrows + dots. Pauses on hover/focus.
export default function ValuesCarousel() {
  const values = WHY_PL.values
  const count = values.length
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const go = useCallback((d: number) => setI((p) => (p + d + count) % count), [count])

  const pausedRef = useRef(paused)
  pausedRef.current = paused
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setI((p) => (p + 1) % count)
    }, 5000)
    return () => clearInterval(id)
  }, [count])

  const v = values[i]
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      className="careers-values-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="careers-vcard" key={i}>
        <span className="careers-vcard-index">
          {pad(i + 1)} <span className="careers-vcard-index-total">/ {pad(count)}</span>
        </span>
        <h3 className="careers-vcard-title">{v.title}</h3>
        <p className="careers-vcard-body">{v.body}</p>
      </div>

      <div className="careers-vcard-nav">
        <div className="careers-dots">
          {values.map((val, idx) => (
            <button
              key={val.title}
              aria-label={val.title}
              aria-selected={idx === i}
              className={`careers-dot${idx === i ? ' is-active' : ''}`}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
        <div className="careers-vcard-arrows">
          <button className="careers-carousel-arrow" onClick={() => go(-1)} aria-label="Previous value">
            &larr;
          </button>
          <button className="careers-carousel-arrow" onClick={() => go(1)} aria-label="Next value">
            &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
