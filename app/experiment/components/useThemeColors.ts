'use client'

import { useMemo } from 'react'
import { useTheme } from './ThemeProvider'

/**
 * Pre-computed canvas/WebGL colors that adapt to the current theme.
 * Use in any component that draws with imperative canvas/GL APIs.
 */
export function useThemeColors() {
  const { isDark } = useTheme()

  return useMemo(() => ({
    isDark,

    // Canvas fill backgrounds
    bgFill: isDark ? '#000000' : '#fafafa',
    bgFillRgb: isDark ? '0, 0, 0' : '250, 250, 250',

    // Primary line/shape color (white on dark, near-black on light)
    lineColor: isDark ? '255, 255, 255' : '30, 30, 30',
    lineHex: isDark ? '#ffffff' : '#1e1e1e',

    // Secondary muted color
    mutedHex: isDark ? '#AEA6B6' : '#666666',

    // For canvas rgba() calls: pass as template `rgba(${c.lineColor}, 0.3)`
    // Grid base alpha
    gridAlpha: isDark ? 0.03 : 0.06,

    // Trail / highlight alpha multiplier
    trailAlpha: isDark ? 0.3 : 0.4,

    // Footer wave line color
    waveLineColor: isDark ? '#AEA6B6' : '#888888',

    // WebGL: base color (near-black or near-white)
    glBase: isDark ? 0.004 : 0.96,
    glReveal: isDark ? 0.14 : 0.88,

    // Convergence box
    boxBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    boxText: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
  }), [isDark])
}
