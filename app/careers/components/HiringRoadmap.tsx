'use client'

import { useState } from 'react'
import { HOW_WE_HIRE } from '../data/careersContent'

// Interactive roadmap for the hiring stages: a connected row of nodes with a
// progress rail. Hover (or tap) a node to walk the path; the detail panel
// below cross-fades to that stage. Replaces the static numbered list.
export default function HiringRoadmap() {
  const steps = HOW_WE_HIRE.steps
  const [active, setActive] = useState(0)
  const progress = steps.length > 1 ? active / (steps.length - 1) : 0
  const s = steps[active]

  return (
    <div className="careers-roadmap">
      <div className="careers-roadmap-track">
        <div className="careers-roadmap-rail" aria-hidden="true">
          <div className="careers-roadmap-rail-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        {steps.map((step, idx) => (
          <button
            key={step.label}
            className={`careers-node${idx === active ? ' is-active' : ''}${idx < active ? ' is-done' : ''}`}
            onMouseEnter={() => setActive(idx)}
            onFocus={() => setActive(idx)}
            onClick={() => setActive(idx)}
            aria-pressed={idx === active}
            aria-label={`Stage ${step.label}: ${step.title}`}
          >
            <span className="careers-node-dot">{step.label}</span>
            <span className="careers-node-caption">{step.title}</span>
          </button>
        ))}
      </div>

      <div className="careers-roadmap-detail" key={active}>
        <span className="careers-roadmap-detail-index">{s.label}</span>
        <div>
          <h3 className="careers-roadmap-detail-title">{s.title}</h3>
          <p className="careers-roadmap-detail-body">{s.body}</p>
        </div>
      </div>
    </div>
  )
}
