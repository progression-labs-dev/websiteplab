'use client'

import { useEffect, useRef, useCallback } from 'react'

// Brand palette (synced with hero shader)
const BRAND_COLORS: [number, number, number][] = [
  [186, 85, 211],
  [255, 160, 122],
  [185, 233, 121],
  [64, 224, 208],
  [0, 0, 255],
]
const CYCLE_SEC = 30
function ssmooth(t: number) { return t * t * (3 - 2 * t) }

type ColorCallback = (r: number, g: number, b: number) => void

// Singleton RAF loop — all subscribers share one animation frame
const subscribers = new Set<ColorCallback>()
let rafId: number | null = null
let startTime: number | null = null

function tick() {
  if (startTime === null) startTime = performance.now() / 1000

  const elapsed = performance.now() / 1000 - startTime
  const progress = (elapsed % CYCLE_SEC) / CYCLE_SEC
  const segProgress = progress * 5
  const segIndex = Math.floor(segProgress) % 5
  const t = ssmooth(segProgress - Math.floor(segProgress))

  const from = BRAND_COLORS[segIndex]
  const to = BRAND_COLORS[(segIndex + 1) % 5]
  const r = Math.round(from[0] + (to[0] - from[0]) * t)
  const g = Math.round(from[1] + (to[1] - from[1]) * t)
  const b = Math.round(from[2] + (to[2] - from[2]) * t)

  subscribers.forEach(cb => cb(r, g, b))

  rafId = requestAnimationFrame(tick)
}

function subscribe(cb: ColorCallback) {
  subscribers.add(cb)
  if (subscribers.size === 1) {
    startTime = null
    rafId = requestAnimationFrame(tick)
  }
  return () => {
    subscribers.delete(cb)
    if (subscribers.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
      startTime = null
    }
  }
}

/**
 * Shared color-cycle hook. A single RAF loop drives all consumers.
 * Returns a ref callback — attach it to the element that needs the gradient.
 * Optionally pass extra refs that need custom properties (e.g., terminal accent).
 */
export function useColorCycle(
  extraRefs?: React.RefObject<HTMLElement | null>[]
) {
  const elRef = useRef<HTMLDivElement>(null)

  const applyColor = useCallback((r: number, g: number, b: number) => {
    if (elRef.current) {
      elRef.current.style.backgroundImage = `linear-gradient(
        to bottom,
        rgba(${r}, ${g}, ${b}, 0.8) 0%,
        rgba(${r}, ${g}, ${b}, 0.5) 30%,
        rgba(${r}, ${g}, ${b}, 0.18) 65%,
        transparent 100%
      )`
    }
    if (extraRefs) {
      for (const ref of extraRefs) {
        if (ref.current) {
          ref.current.style.setProperty('--t-accent', `rgb(${r}, ${g}, ${b})`)
          ref.current.style.setProperty('--t-accent-dim', `rgba(${r}, ${g}, ${b}, 0.12)`)
          ref.current.style.setProperty('--t-accent-glow', `rgba(${r}, ${g}, ${b}, 0.2)`)
        }
      }
    }
  }, [extraRefs])

  useEffect(() => {
    return subscribe(applyColor)
  }, [applyColor])

  return elRef
}
