'use client'

import { useEffect, useRef, useCallback } from 'react'

const SHUFFLE_CHARS = '01'

interface ScrollDecodeProps {
  text: string
  trigger?: 'inView' | 'manual'
  triggerWhen?: boolean
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  className?: string
  duration?: number
  onComplete?: () => void
}

export default function ScrollDecode({
  text,
  trigger = 'inView',
  triggerWhen,
  tag: Tag = 'span',
  className,
  duration = 800,
  onComplete,
}: ScrollDecodeProps) {
  const elRef = useRef<HTMLElement>(null)
  const hasRunRef = useRef(false)
  const rafRef = useRef<number>(0)

  const decode = useCallback(() => {
    const el = elRef.current
    if (!el || hasRunRef.current) return
    hasRunRef.current = true

    const chars = text.split('')
    const len = chars.length
    const charDelay = duration / len
    let startTime: number | null = null

    const animate = (now: number) => {
      if (!startTime) startTime = now
      const elapsed = now - startTime
      const resolved = Math.min(len, Math.floor(elapsed / charDelay))

      let output = ''
      for (let i = 0; i < len; i++) {
        if (chars[i] === ' ') {
          output += ' '
        } else if (i < resolved) {
          output += chars[i]
        } else {
          output += SHUFFLE_CHARS[Math.floor(Math.random() * 2)]
        }
      }

      el.textContent = output

      if (resolved < len) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        el.textContent = text
        onComplete?.()
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [text, duration, onComplete])

  // On mount: show binary noise as placeholder
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    el.textContent = text
      .split('')
      .map((c) => (c === ' ' ? ' ' : SHUFFLE_CHARS[Math.floor(Math.random() * 2)]))
      .join('')
  }, [text])

  // IntersectionObserver trigger
  useEffect(() => {
    if (trigger !== 'inView') return
    const el = elRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          decode()
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [trigger, decode])

  // Manual trigger
  useEffect(() => {
    if (trigger === 'manual' && triggerWhen) {
      decode()
    }
  }, [trigger, triggerWhen, decode])

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = elRef as any

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
