'use client'

import { useState, useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_+<>[]'

/**
 * Fast terminal-style text scramble that resolves left-to-right.
 * Characters rapidly cycle through random technical chars before
 * locking into the correct final string.
 *
 * Replays every time `trigger` flips from false → true.
 * When trigger goes back to false, resets so the next true fires fresh.
 */
export function useTerminalScramble(
  text: string,
  trigger: boolean,
  duration: number = 500
): string {
  const [displayText, setDisplayText] = useState(text)
  const rafRef = useRef<number>(0)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    // Trigger went false — reset for next play
    if (!trigger) {
      cancelAnimationFrame(rafRef.current)
      isPlayingRef.current = false
      setDisplayText(text)
      return
    }

    // Already animating, skip
    if (isPlayingRef.current) return

    // Fire animation
    isPlayingRef.current = true
    const startTime = performance.now()
    const len = text.length

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1) * len

      let result = ''
      for (let i = 0; i < len; i++) {
        if (text[i] === ' ') {
          result += ' '
        } else if (i < progress) {
          result += text[i]
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }

      setDisplayText(result)

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayText(text)
        isPlayingRef.current = false
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafRef.current)
  }, [trigger, text, duration])

  return displayText
}
