'use client'

import { useEffect, useRef, useCallback } from 'react'
import { SHARED_START } from './sharedTime'

// Brand palette — royal blue + warm accents only (no yellow, no purple, no
// green). Mirrors the case-study banner shader cycle.
const cB: [number, number, number]           = [0, 0, 255]      // #0000FF royal blue
const cPeach: [number, number, number]       = [255, 218, 185]  // #FFDAB9 peach
const cLightOrange: [number, number, number] = [255, 160, 122]  // #FFA07A light orange

// 4-state dual-color cycle: blue → blue+peach → blue → blue+light-orange.
// Stays in brand-warm territory throughout — used to drive --t-accent on the
// FindYourFit terminal animated icons (BounceRings, ProcessRings, PulsingGrid).
const STATES: [[number,number,number],[number,number,number],[number,number,number],[number,number,number]][] = [
  [cB,     cB,           cB, cPeach],        // 0: blue → blue+peach
  [cB,     cPeach,        cB, cB],            // 1: blue+peach → blue
  [cB,     cB,            cB, cLightOrange],  // 2: blue → blue+light-orange
  [cB,     cLightOrange,  cB, cB],            // 3: blue+light-orange → blue
]

const CYCLE_SEC = 20
function ssmooth(t: number) { return t * t * (3 - 2 * t) }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

type ColorCallback = (r: number, g: number, b: number) => void

// Singleton RAF loop — all subscribers share one animation frame
const subscribers = new Set<ColorCallback>()
let rafId: number | null = null

function tick() {
  const elapsed = performance.now() / 1000 - SHARED_START
  const progress = ((elapsed % CYCLE_SEC) + CYCLE_SEC) % CYCLE_SEC / CYCLE_SEC
  const segProgress = progress * STATES.length
  const segIndex = Math.min(Math.floor(segProgress), STATES.length - 1)
  const t = ssmooth(segProgress - Math.floor(segProgress))

  const [fA, fB, tA, tB] = STATES[segIndex]
  // Blend from→to for each of the dual colors, then average them
  const peakAr = lerp(fA[0], tA[0], t)
  const peakAg = lerp(fA[1], tA[1], t)
  const peakAb = lerp(fA[2], tA[2], t)
  const peakBr = lerp(fB[0], tB[0], t)
  const peakBg = lerp(fB[1], tB[1], t)
  const peakBb = lerp(fB[2], tB[2], t)

  // Average of both peaks — represents the dominant hue on screen
  const r = Math.round((peakAr + peakBr) / 2)
  const g = Math.round((peakAg + peakBg) / 2)
  const b = Math.round((peakAb + peakBb) / 2)

  subscribers.forEach(cb => cb(r, g, b))

  rafId = requestAnimationFrame(tick)
}

function subscribe(cb: ColorCallback) {
  subscribers.add(cb)
  if (subscribers.size === 1) {
    rafId = requestAnimationFrame(tick)
  }
  return () => {
    subscribers.delete(cb)
    if (subscribers.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

/**
 * Shared color-cycle hook. A single RAF loop drives all consumers.
 * Returns a ref callback — attach it to the element that needs the gradient.
 * Optionally pass extra refs that need custom properties (e.g., terminal accent).
 */
export function useColorCycle(
  extraRefs?: React.RefObject<HTMLElement | null>[],
  options?: { skipGradient?: boolean }
) {
  const elRef = useRef<HTMLDivElement>(null)

  const applyColor = useCallback((r: number, g: number, b: number) => {
    if (elRef.current && !options?.skipGradient) {
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
  }, [extraRefs, options?.skipGradient])

  useEffect(() => {
    return subscribe(applyColor)
  }, [applyColor])

  return elRef
}
