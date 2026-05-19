'use client'

import { useViewMode } from './ViewModeProvider'

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode()

  return (
    <div
      className="exp-viewmode-toggle"
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
