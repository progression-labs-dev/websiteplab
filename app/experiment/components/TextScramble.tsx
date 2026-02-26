'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Military/tech cipher character pool
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CYAN = '#00E5FF'
const CYAN_GLOW = '0 0 6px rgba(0, 229, 255, 0.4), 0 0 20px rgba(0, 229, 255, 0.15)'
const SCRAMBLE_MS = 55
const RESOLVE_PULSE_MS = 150

interface TextScrambleProps {
  text: string
  trigger: 'load' | 'inView'
  delay?: number
  duration?: number
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p'
  triggerWhen?: boolean
}

export default function TextScramble({
  text,
  trigger,
  delay = 0,
  duration = 1200,
  className,
  tag = 'h2',
  triggerWhen,
}: TextScrambleProps) {
  const containerRef = useRef<HTMLElement>(null)
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'animating' | 'done'>('idle')
  const hasTriggeredRef = useRef(false)
  const frameRef = useRef<number>(0)
  const resolveTimesRef = useRef<number[]>([])

  const displayText = text.toUpperCase()

  useEffect(() => { setMounted(true) }, [])

  const startAnimation = useCallback(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true
    setPhase('animating')
  }, [])

  // Load trigger
  useEffect(() => {
    if (!mounted || trigger !== 'load') return
    if (triggerWhen !== undefined && !triggerWhen) return
    const timer = setTimeout(startAnimation, delay)
    return () => clearTimeout(timer)
  }, [mounted, trigger, delay, triggerWhen, startAnimation])

  // InView trigger
  useEffect(() => {
    if (!mounted || trigger !== 'inView') return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(startAnimation, delay)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [mounted, trigger, delay, startAnimation])

  // Animation loop — "Storm Resolve" stochastic crystallization
  useEffect(() => {
    if (phase !== 'animating') return

    // Pre-compute resolve times for each character
    // Left-biased stochastic: charIndex position adds a small linear bias
    let charIndex = 0
    const totalNonSpace = displayText.split('').filter(c => c !== ' ').length
    const resolveTimes: number[] = []
    for (let i = 0; i < displayText.length; i++) {
      if (displayText[i] === ' ') {
        resolveTimes.push(0) // spaces don't need resolve times
      } else {
        const rt = 0.1 * duration
          + Math.random() * 0.7 * duration
          + 0.15 * (charIndex / Math.max(totalNonSpace, 1)) * duration
        resolveTimes.push(rt)
        charIndex++
      }
    }
    resolveTimesRef.current = resolveTimes

    let start = 0
    let lastScrambleTime = 0

    const tick = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const shouldCycle = elapsed - lastScrambleTime >= SCRAMBLE_MS

      for (let i = 0; i < displayText.length; i++) {
        const span = spanRefs.current[i]
        if (!span) continue
        const char = displayText[i]

        if (char === ' ') {
          span.style.opacity = '1'
          continue
        }

        const rt = resolveTimes[i]

        if (elapsed >= rt) {
          // RESOLVED: show correct character
          span.textContent = char
          span.style.color = 'inherit'
          span.style.opacity = '1'

          // Brief brightness pulse for ~150ms after resolving
          const timeSinceResolve = elapsed - rt
          if (timeSinceResolve < RESOLVE_PULSE_MS) {
            const pulseAlpha = 0.5 * (1 - timeSinceResolve / RESOLVE_PULSE_MS)
            span.style.textShadow = `0 0 6px rgba(255, 255, 255, ${pulseAlpha})`
          } else {
            span.style.textShadow = 'none'
          }
        } else {
          // SCRAMBLING: random char cycling, cyan glow, fully visible
          span.style.opacity = '1'
          span.style.color = CYAN
          span.style.textShadow = CYAN_GLOW
          if (shouldCycle) {
            span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
          }
        }
      }

      if (shouldCycle) lastScrambleTime = elapsed

      if (elapsed >= duration) {
        // Final pass: lock every character to correct state
        for (let i = 0; i < displayText.length; i++) {
          const span = spanRefs.current[i]
          if (!span) continue
          span.textContent = displayText[i] === ' ' ? ' ' : displayText[i]
          span.style.color = 'inherit'
          span.style.textShadow = 'none'
          span.style.opacity = '1'
        }
        setPhase('done')
        return
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [phase, duration, displayText])

  const Tag = tag
  const upperStyle: React.CSSProperties = { textTransform: 'uppercase' }

  // SSR or done: plain text (uppercase)
  if (!mounted || phase === 'done') {
    return (
      <Tag ref={containerRef as React.Ref<HTMLHeadingElement>} className={className || ''} style={upperStyle}>
        {text}
      </Tag>
    )
  }

  // Idle (before trigger): invisible text, layout reserved
  if (phase === 'idle') {
    return (
      <Tag ref={containerRef as React.Ref<HTMLHeadingElement>} className={className || ''} style={upperStyle}>
        <span style={{ visibility: 'hidden' }}>{text}</span>
      </Tag>
    )
  }

  // Animating: per-character spans — all start visible as scrambled chars
  return (
    <Tag
      ref={containerRef as React.Ref<HTMLHeadingElement>}
      className={className || ''}
      style={{ position: 'relative', ...upperStyle }}
      suppressHydrationWarning
    >
      {/* Hidden spacer — locks layout to final uppercase text dimensions */}
      <span style={{ visibility: 'hidden' }} aria-hidden="true">{text}</span>

      {/* Per-character cipher overlay — starts fully visible as scrambled */}
      <span
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        aria-label={text}
      >
        {displayText.split('').map((char, i) => (
          <span
            key={i}
            ref={el => { spanRefs.current[i] = el }}
            className="scramble-char"
            style={{ opacity: 1 }}
          >
            {char === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]}
          </span>
        ))}
      </span>
    </Tag>
  )
}
