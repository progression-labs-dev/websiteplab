'use client'

import { type ElementType, type CSSProperties } from 'react'
import { useTerminalScramble } from '../hooks/useTerminalScramble'

export default function TerminalText({
  children,
  trigger,
  duration = 500,
  as: Tag = 'span',
  className,
  style,
}: {
  children: string
  trigger: boolean
  duration?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}) {
  const displayText = useTerminalScramble(children, trigger, duration)
  return <Tag className={className} style={style}>{displayText}</Tag>
}
