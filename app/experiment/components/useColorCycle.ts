'use client'

import { useEffect, useRef, useCallback } from 'react'
import { SHARED_START } from './sharedTime'

// Brand palette — same 5 colors as hero shader
const cO: [number, number, number] = [186, 85, 211]   // Orchid
const cS: [number, number, number] = [255, 160, 122]  // Salmon
const cG: [number, number, number] = [185, 233, 121]  // Green
const cT: [number, number, number] = [64, 224, 208]   // Turquoise
const cB: [number, number, number] = [0, 0, 255]      // Blue

// Extended palette — peak pairs for 5 themed states (mirrors shader cGold/cVanilla/etc.)
const cGold: [number, number, number]        = [184, 171, 56]   // #B8AB38
const cVanilla: [number, number, number]     = [224, 215, 148]  // #E0D794
const cWine: [number, number, number]        = [111, 29, 27]    // #6F1D1B
const cAshGrey: [number, number, number]     = [173, 189, 171]  // #ADBDAB
const cBurntPeach: [number, number, number]  = [226, 114, 91]   // #E2725B
const cSoftApricot: [number, number, number] = [255, 218, 185]  // #FFDAB9
const cInferno: [number, number, number]     = [170, 0, 3]      // #AA0003
const cPeriwinkle: [number, number, number]  = [191, 180, 220]  // #BFB4DC
const cMagenta: [number, number, number]     = [255, 0, 255]    // #FF00FF
const cYellow: [number, number, number]      = [255, 255, 0]    // #FFFF00

// 14-state dual-color cycle — mirrors hero/FYF/footer shaders exactly
const STATES: [[number,number,number],[number,number,number],[number,number,number],[number,number,number]][] = [
  [cO,          cO,           cB,          cS],          // 0
  [cB,          cS,           cG,          cG],          // 1
  [cG,          cG,           cGold,       cVanilla],    // 2  → Ancient Gild
  [cGold,       cVanilla,     cO,          cT],          // 3  bridge
  [cO,          cT,           cS,          cS],          // 4
  [cS,          cS,           cBurntPeach, cSoftApricot],// 5  → Terracotta Sunset
  [cBurntPeach, cSoftApricot, cWine,       cAshGrey],    // 6  → Vintage Hearth
  [cWine,       cAshGrey,     cB,          cT],          // 7  bridge
  [cB,          cT,           cB,          cB],          // 8
  [cB,          cB,           cInferno,    cPeriwinkle], // 9  → Scarlet Glacier
  [cInferno,    cPeriwinkle,  cMagenta,    cYellow],     // 10 → Retro Future
  [cMagenta,    cYellow,      cO,          cG],          // 11 bridge
  [cO,          cG,           cT,          cT],          // 12
  [cT,          cT,           cO,          cO],          // 13
]

const CYCLE_SEC = 70
function ssmooth(t: number) { return t * t * (3 - 2 * t) }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

type ColorCallback = (r: number, g: number, b: number) => void

// Singleton RAF loop — all subscribers share one animation frame
const subscribers = new Set<ColorCallback>()
let rafId: number | null = null

function tick() {
  const elapsed = performance.now() / 1000 - SHARED_START
  const progress = ((elapsed % CYCLE_SEC) + CYCLE_SEC) % CYCLE_SEC / CYCLE_SEC
  const segProgress = progress * 14
  const segIndex = Math.min(Math.floor(segProgress), 13)
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
