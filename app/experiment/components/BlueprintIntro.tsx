'use client'

import { useEffect, useRef } from 'react'

interface BlueprintIntroProps {
  onComplete: () => void
}

type Seg = string | [string, string]

export default function BlueprintIntro({ onComplete }: BlueprintIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const animating = useRef(false)

  useEffect(() => {
    const terminal = terminalRef.current
    const container = containerRef.current
    if (!terminal || !container) return

    let cancelled = false
    terminal.innerHTML = ''

    // Deferred start + ref guard: bulletproof against StrictMode double-fire
    const startTimer = setTimeout(() => {
      if (animating.current || cancelled) return
      animating.current = true
      run()
    }, 50)

    // ── Helpers ──────────────────────────────────────────────────

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        if (cancelled) return resolve()
        setTimeout(resolve, ms)
      })

    const addLine = (cls?: string): HTMLDivElement => {
      const el = document.createElement('div')
      el.className = `exp-boot-line${cls ? ` ${cls}` : ''}`
      if (!cancelled) {
        terminal.appendChild(el)
        terminal.scrollTop = terminal.scrollHeight
      }
      return el
    }

    const type = async (segments: Seg[], cls?: string, speed = 18) => {
      if (cancelled) return
      const line = addLine(cls)
      line.classList.add('exp-boot-typing')

      for (const seg of segments) {
        const text = typeof seg === 'string' ? seg : seg[0]
        const segCls = typeof seg === 'string' ? undefined : seg[1]
        const span = document.createElement('span')
        if (segCls) span.className = segCls
        line.appendChild(span)

        for (let i = 0; i < text.length; i++) {
          if (cancelled) { span.textContent = text; break }
          span.textContent = text.slice(0, i + 1)
          terminal.scrollTop = terminal.scrollHeight
          let d = speed + (Math.random() - 0.5) * speed * 0.5
          if (Math.random() < 0.04) d += 50 + Math.random() * 80
          await wait(d)
        }
      }

      line.classList.remove('exp-boot-typing')
    }

    const print = (text: string, cls?: string) => {
      const line = addLine(cls)
      line.textContent = text
    }

    const bar = async (steps: [number, number][], width = 32) => {
      if (cancelled) return
      const line = addLine('exp-boot-progress exp-boot-typing')
      for (const [pct, delay] of steps) {
        if (cancelled) break
        const filled = Math.round((pct / 100) * width)
        line.textContent = `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}] ${pct}%`
        terminal.scrollTop = terminal.scrollHeight
        await wait(delay)
      }
      line.classList.remove('exp-boot-typing')
    }

    // ── Minimal sequence ────────────────────────────────────────

    const run = async () => {
      // 1. Command
      await type(['$ python progression_labs.py'], 'exp-boot-cmd', 40)
      await wait(400)

      // 2. Welcome — shimmer on "Progression Labs"
      print('')
      await type(
        ['>>> Welcome to ', ['Progression Labs', 'exp-boot-shimmer']],
        'exp-boot-prompt',
        22,
      )
      await wait(300)

      // 3. Loading bar
      print('')
      await bar([
        [0, 200],
        [14, 250],
        [31, 300],
        [52, 280],
        [68, 250],
        [85, 220],
        [100, 200],
      ])
      await wait(400)

      // 4. Sign-off
      print('')
      await type(['>>> Please enjoy your stay.'], 'exp-boot-signoff', 28)
      await wait(800)

      // 5. Fade out → onComplete
      if (!cancelled && container) {
        container.style.transition = 'opacity 500ms ease'
        container.style.opacity = '0'
        await wait(500)
        if (!cancelled) {
          container.style.display = 'none'
          onComplete()
        }
      }
    }

    return () => {
      cancelled = true
      clearTimeout(startTimer)
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="exp-boot-overlay"
    >
      <div ref={terminalRef} className="exp-boot-terminal" />
    </div>
  )
}
