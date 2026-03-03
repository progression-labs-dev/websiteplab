'use client'

import { useRef, useCallback } from 'react'

/**
 * ShuffleHover — Isidor-style binary "01" scramble on hover
 *
 * On mouseenter: text scrambles to random 0/1 characters at 60ms intervals
 * On mouseleave: restores original text (instant)
 * Preserves spaces. Works on any inline/block element.
 */

const SHUFFLE_CHARS = '01'
const SHUFFLE_INTERVAL = 60
const SHUFFLE_TIMEOUT = 500

interface ShuffleHoverProps {
  text: string
  tag?: keyof JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
  href?: string
  onClick?: () => void
}

export default function ShuffleHover({
  text,
  tag: Tag = 'span' as keyof JSX.IntrinsicElements,
  className,
  style,
  href,
  onClick,
}: ShuffleHoverProps) {
  const elRef = useRef<HTMLElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    const el = elRef.current
    if (!el) return
    clearTimers()

    intervalRef.current = setInterval(() => {
      el.textContent = text
        .split('')
        .map((c) => (c === ' ' ? ' ' : SHUFFLE_CHARS[Math.floor(Math.random() * 2)]))
        .join('')
    }, SHUFFLE_INTERVAL)

    // Auto-stop after timeout
    timeoutRef.current = setTimeout(() => {
      clearTimers()
      if (el) el.textContent = text
    }, SHUFFLE_TIMEOUT)
  }, [text, clearTimers])

  const handleMouseLeave = useCallback(() => {
    clearTimers()
    const el = elRef.current
    if (el) el.textContent = text
  }, [text, clearTimers])

  const props = {
    ref: elRef as React.Ref<HTMLElement>,
    className,
    style,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick,
    ...(href ? { href } : {}),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = Tag as any

  return <Component {...props}>{text}</Component>
}
