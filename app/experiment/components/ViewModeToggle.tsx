'use client'

import { useEffect, useState } from 'react'
import { useViewMode } from './ViewModeProvider'

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode()
  // Flip palette to light when the dark hero has faded past ~40% — by then the
  // surface behind the toggle (bottom of the viewport) is mostly parchment, and
  // a dark glass pill stops reading against the off-white background.
  const [overLight, setOverLight] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setOverLight(window.scrollY > window.innerHeight * 0.4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="exp-viewmode-toggle"
      data-over-light={overLight ? 'true' : 'false'}
      role="radiogroup"
      aria-label="View mode"
    >
      {/* Sliding indicator — moves left/right based on active segment */}
      <div
        className="exp-viewmode-slider"
        style={{ transform: viewMode === 'machine' ? 'translateX(100%)' : 'translateX(0)' }}
      />
      <button
        className={`exp-viewmode-seg${viewMode === 'human' ? ' exp-viewmode-seg--active' : ''}`}
        onClick={() => setViewMode('human')}
        role="radio"
        aria-checked={viewMode === 'human'}
      >
        Human
      </button>
      <button
        className={`exp-viewmode-seg${viewMode === 'machine' ? ' exp-viewmode-seg--active' : ''}`}
        onClick={() => setViewMode('machine')}
        role="radio"
        aria-checked={viewMode === 'machine'}
      >
        Machine
      </button>
    </div>
  )
}
