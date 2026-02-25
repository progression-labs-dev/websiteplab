'use client'

import { type ElementType, type CSSProperties, useState, useEffect } from 'react'
import { useTerminalScramble } from '../hooks/useTerminalScramble'

const BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'section', 'article'])

export default function TerminalText({
  children,
  trigger,
  duration = 500,
  delay = 0,
  as: Tag = 'span',
  className,
  style,
}: {
  children: string
  trigger: boolean
  duration?: number
  delay?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}) {
  // Delay the scramble start so right-side elements begin scrambling
  // exactly when the clip-path wipe reaches them
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!trigger) {
      setIsReady(false)
      return
    }
    if (delay === 0) {
      setIsReady(true)
      return
    }
    const timer = setTimeout(() => setIsReady(true), delay)
    return () => clearTimeout(timer)
  }, [trigger, delay])

  const displayText = useTerminalScramble(children, isReady, duration)
  const isBlock = typeof Tag === 'string' && BLOCK_TAGS.has(Tag)

  return (
    <Tag
      className={className}
      style={{
        ...style,
        position: 'relative' as const,
        ...(isBlock ? {} : { display: 'inline-block' as const }),
      }}
    >
      {/* Invisible dummy — holds exact layout space for final text */}
      <span
        style={{
          opacity: 0,
          pointerEvents: 'none' as const,
          userSelect: 'none' as const,
          ...(isBlock ? {} : { whiteSpace: 'nowrap' as const }),
        }}
        aria-hidden="true"
      >
        {children}
      </span>
      {/* Scrambling overlay — positioned over the dummy */}
      <span
        style={{
          position: 'absolute' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none' as const,
          ...(isBlock ? {} : { whiteSpace: 'nowrap' as const }),
        }}
      >
        {displayText}
      </span>
    </Tag>
  )
}
