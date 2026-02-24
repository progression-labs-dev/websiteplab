'use client'

import { useState, useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_+<>[]'

/**
 * Fast terminal-style text scramble that resolves left-to-right.
 * Characters rapidly cycle through random technical chars before
 * locking into the correct final string.
 *
 * Plays once when `trigger` flips to true. After that, text updates
 * pass through unchanged (no re-scramble on every clock tick, etc.)
 */
export function useTerminalScramble(
  text: string,
  trigger: boolean,
  duration: number = 500
): string {
  const [displayText, setDisplayText] = useState(text)
  const rafRef = useRef<number>(0)
  const hasPlayedRef = useRef(false)

  useEffect(() => {
    // After initial animation, just pass text through
    if (hasPlayedRef.current) {
      setDisplayText(text)
      return
    }

    // Before trigger, show the real text (hidden by clip-path anyway)
    if (!trigger) {
      setDisplayText(text)
      return
    }

    // Fire once
    hasPlayedRef.current = true
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
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafRef.current)
  }, [trigger, text, duration])

  return displayText
}
