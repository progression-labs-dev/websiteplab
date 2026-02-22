'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Military/tech cipher character pool
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CYAN = '#00E5FF'
const CYAN_GLOW = '0 0 8px rgba(0, 229, 255, 0.6), 0 0 20px rgba(0, 229, 255, 0.15)'
const TAIL = 5 // scramble tail length (3-6 chars at leading edge)

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

  // Animation loop — progressive typewriter scramble
  useEffect(() => {
    if (phase !== 'animating') return

    let start = 0
    let lastScrambleTime = 0
    const SCRAMBLE_MS = 40
    // leadPos travels from 0 to text.length + TAIL
    // so the scramble tail fully exits the right side
    const totalTravel = displayText.length + TAIL

    const tick = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const t = Math.min(elapsed / duration, 1)

      // Linear left-to-right leading edge position
      const leadPos = t * totalTravel
      const shouldCycle = elapsed - lastScrambleTime >= SCRAMBLE_MS

      for (let i = 0; i < displayText.length; i++) {
        const span = spanRefs.current[i]
        if (!span) continue
        const char = displayText[i]

        if (char === ' ') {
          // Spaces: visible once the lead has passed, invisible otherwise
          span.style.opacity = i < leadPos ? '1' : '0'
          continue
        }

        if (i < leadPos - TAIL) {
          // STATE C — LOCKED: correct character, inherit color, fully visible
          span.textContent = char
          span.style.color = 'inherit'
          span.style.textShadow = 'none'
          span.style.opacity = '1'
        } else if (i < leadPos) {
          // STATE B — SCRAMBLING: random character, cyan, visible
          span.style.opacity = '1'
          span.style.color = CYAN
          span.style.textShadow = CYAN_GLOW
          if (shouldCycle) {
            span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
          }
        } else {
          // STATE A — FUTURE: completely invisible
          span.style.opacity = '0'
        }
      }

      if (shouldCycle) lastScrambleTime = elapsed

      if (t >= 1) {
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

  // Animating: per-character spans — all start invisible, revealed progressively
  return (
    <Tag
      ref={containerRef as React.Ref<HTMLHeadingElement>}
      className={className || ''}
      style={{ position: 'relative', ...upperStyle }}
      suppressHydrationWarning
    >
      {/* Hidden spacer — locks layout to final uppercase text dimensions */}
      <span style={{ visibility: 'hidden' }} aria-hidden="true">{text}</span>

      {/* Per-character cipher overlay — starts fully invisible */}
      <span
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        aria-label={text}
      >
        {displayText.split('').map((char, i) => (
          <span
            key={i}
            ref={el => { spanRefs.current[i] = el }}
            style={{ opacity: 0 }}
          >
            {char === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]}
          </span>
        ))}
      </span>
    </Tag>
  )
}
