'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CULTURE } from '../data/careersContent'

// Northslope-style culture tabs: a tabbed showcase of photoreal office/London
// ambiance with one line of copy each. Restrained cross-fade between tabs.
export default function CultureTabs() {
  const { eyebrow, heading, tabs } = CULTURE
  const [active, setActive] = useState(0)
  const current = tabs[active]

  return (
    <section className="careers-section careers-culture" id="life" data-theme="light" data-tone="light">
      <div className="careers-inner">
        <p className="careers-eyebrow">{eyebrow}</p>
        <h2 className="careers-heading">{heading}</h2>

        <div className="careers-tabs" role="tablist" aria-label="Life at Progression Labs">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={i === active}
              className={`careers-tab${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="careers-culture-stage">
          <div className="careers-culture-media">
            {tabs.map((t, i) => (
              <Image
                key={t.key}
                src={t.image}
                alt={t.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 64vw"
                className={`careers-culture-img${i === active ? ' is-active' : ''}`}
              />
            ))}
          </div>
          <div className="careers-culture-caption" key={current.key}>
            <h3 className="careers-culture-heading">{current.heading}</h3>
            <p className="careers-culture-body">{current.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
