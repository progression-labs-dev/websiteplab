'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import TerminalText from './TerminalText'

const VALUE_CARDS = [
  {
    number: '01',
    title: 'Proven success, every time',
    text: 'Playbook tested across industries. Senior engineers who\'ve done this before. Every engagement follows a methodology we\'ve refined over dozens of deployments - so you get certainty, not experiments.',
  },
  {
    number: '02',
    title: 'You\'ll know it\'s working',
    text: 'Live production metrics, not slideware. Operations counted, not opportunities pitched. We report in dashboards you can check any time - real throughput, real cost savings, updated daily.',
  },
  {
    number: '03',
    title: 'If it doesn\'t fit, we don\'t build it',
    text: 'Audit first, filter ruthlessly. No forced features. We start every engagement with a deep-dive assessment. If a use case doesn\'t pass our viability bar, we tell you before a line of code is written.',
  },
  {
    number: '04',
    title: 'Built to last after we leave',
    text: 'Docs, training, named owner on your team. Independence is our success metric. We design ourselves out of the job - every system comes with runbooks, training sessions, and a named internal owner who can maintain it solo.',
  },
  {
    number: '05',
    title: 'Your people, upgraded',
    text: 'Engineers learn production AI patterns. Capability stays after we leave. We pair with your engineers daily, run workshops, and leave behind codified patterns - so your team builds the next agent without us.',
  },
  {
    number: '06',
    title: 'Your success is our success',
    text: 'We don\'t just deliver and walk away. Your success is our benchmark - we stay accountable to your results, because ensuring you win is the whole point.',
  },
]

/* ── Pixel Overlay Utilities ────────────────── */

const PIXEL_COLS = 10
const PIXEL_ROWS = 6

function hashNoise(col: number, row: number, seed: number): number {
  let h = (seed * 7919 + col * 131 + row * 524287) | 0
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = (h >> 16) ^ h
  return (h & 0x7fffffff) / 0x7fffffff
}

function buildSortedBlocks(seed: number): { col: number; row: number; threshold: number }[] {
  const blocks: { col: number; row: number; threshold: number }[] = []
  for (let r = 0; r < PIXEL_ROWS; r++) {
    for (let c = 0; c < PIXEL_COLS; c++) {
      const noise = hashNoise(c, r, seed)
      const wipe = c / (PIXEL_COLS - 1)
      const threshold = noise * 0.4 + wipe * 0.6
      blocks.push({ col: c, row: r, threshold })
    }
  }
  blocks.sort((a, b) => a.threshold - b.threshold)
  return blocks
}

function ValuePixelOverlay({ seed }: { seed: number }) {
  const blocks = buildSortedBlocks(seed)
  return (
    <div className="value-pixel-overlay">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="value-pixel-block"
          style={{
            left: `${(block.col / PIXEL_COLS) * 100}%`,
            top: `${(block.row / PIXEL_ROWS) * 100}%`,
            width: `${100 / PIXEL_COLS}%`,
            height: `${100 / PIXEL_ROWS}%`,
            opacity: 0,
          }}
        />
      ))}
      <div className="value-scan-edge" />
    </div>
  )
}

/* ── SVG Animations ─────────────────────────── */

/* Card 01 — Bars + Checkmarks (blue #60a5fa accent) */
function BarsAnimation() {
  return (
    <svg viewBox="0 0 240 180" fill="none" className="value-svg">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        const barW = 144 - i * 12
        const y = 14 + i * 32
        return (
          <g key={i}>
            {i < 4 && (
              <line
                className="value-connect-line"
                x1={24 + barW / 2}
                y1={y + 22}
                x2={24 + (132 - (i + 1) * 12) / 2}
                y2={y + 32}
                stroke="rgba(96,165,250,0.12)"
                strokeWidth="1"
                strokeDasharray="3 2"
                style={{ animationDelay: `${0.1 + i * 0.15}s` }}
              />
            )}
            <rect
              className="value-bar"
              x="24"
              y={y}
              width={barW}
              height="20"
              rx="10"
              fill="url(#barGrad)"
              stroke="rgba(96,165,250,0.4)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
            <path
              className="value-checkmark"
              d={`M${182},${y + 3} l6,8 l11,-13`}
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ animationDelay: `${0.2 + i * 0.15}s` }}
            />
          </g>
        )
      })}
    </svg>
  )
}

/* Card 02 — Dashboard (orange #fb923c accent, LIVE repositioned) */
function DashboardAnimation() {
  const pts = [
    { x: 24, y: 150 }, { x: 54, y: 140 }, { x: 84, y: 122 },
    { x: 114, y: 128 }, { x: 144, y: 98 }, { x: 174, y: 86 }, { x: 204, y: 68 },
  ]
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL']
  return (
    <svg viewBox="0 0 240 180" fill="none" className="value-svg">
      {/* Primary metric box */}
      <rect x="18" y="12" width="86" height="52" rx="5" stroke="rgba(251,146,60,0.3)" strokeWidth="1" fill="rgba(251,146,60,0.06)" />
      <text x="61" y="32" textAnchor="middle" fill="rgba(251,146,60,0.4)" fontSize="8" fontFamily="JetBrains Mono, monospace">OPS / DAY</text>
      <text className="value-counter" x="61" y="52" textAnchor="middle" fill="#fb923c" fontSize="19" fontFamily="JetBrains Mono, monospace">2,847</text>

      {/* Secondary metric box */}
      <rect x="114" y="12" width="86" height="52" rx="5" stroke="rgba(251,146,60,0.3)" strokeWidth="1" fill="rgba(251,146,60,0.06)" />
      <text x="157" y="32" textAnchor="middle" fill="rgba(251,146,60,0.4)" fontSize="8" fontFamily="JetBrains Mono, monospace">COST SAVED</text>
      <text className="value-counter value-counter-2" x="157" y="52" textAnchor="middle" fill="#fb923c" fontSize="19" fontFamily="JetBrains Mono, monospace">$41K</text>

      {/* Live indicator — aligned with metric box centers */}
      <circle className="value-pulse" cx="211" cy="37" r="3" fill="#fb923c" />
      <text x="211" y="49" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="JetBrains Mono, monospace">LIVE</text>

      {/* Line chart */}
      <polyline
        className="value-chart-line"
        points={pts.map(p => `${p.x},${p.y}`).join(' ')}
        stroke="#fb923c"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        className="value-chart-area"
        points={`${pts.map(p => `${p.x},${p.y}`).join(' ')} 204,158 24,158`}
        fill="rgba(251,146,60,0.08)"
      />

      {/* Dot markers */}
      {pts.map((p, i) => (
        <circle
          key={i}
          className="value-chart-dot"
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="#fb923c"
          stroke="var(--bg-cream)"
          strokeWidth="1.5"
          style={{ animationDelay: `${1.2 + i * 0.08}s` }}
        />
      ))}

      {/* Axis */}
      <line x1="24" y1="158" x2="216" y2="158" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* Month labels */}
      {months.map((m, i) => (
        <text
          key={m}
          className="value-axis-label"
          x={24 + i * 30}
          y="170"
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize="6.5"
          fontFamily="JetBrains Mono, monospace"
          style={{ animationDelay: `${1.4 + i * 0.06}s` }}
        >{m}</text>
      ))}
    </svg>
  )
}

/* Card 03 — Puzzle Pieces (purple #a78bfa accent, real jigsaw shapes) */
function PuzzleAnimation() {
  /* 3×2 grid of interlocking jigsaw pieces.
     Tabs protrude 10px, sockets indent 10px.
     Grid: x 30–210, y 20–120 (60×50 cells). */
  const pieces = [
    // Piece 1 — top left: flat top, right tab, bottom tab, flat left
    'M30,20 L90,20 L90,38 C93,38 100,41 100,45 C100,49 93,52 90,52 L90,70 L67,70 C67,73 64,80 60,80 C56,80 53,73 53,70 L30,70 Z',
    // Piece 2 — top mid: flat top, right tab, bottom socket, left socket
    'M90,20 L150,20 L150,38 C153,38 160,41 160,45 C160,49 153,52 150,52 L150,70 L127,70 C127,67 124,60 120,60 C116,60 113,67 113,70 L90,70 L90,52 C93,52 100,49 100,45 C100,41 93,38 90,38 Z',
    // Piece 3 — top right: flat top, flat right, bottom tab, left socket
    'M150,20 L210,20 L210,70 L187,70 C187,73 184,80 180,80 C176,80 173,73 173,70 L150,70 L150,52 C153,52 160,49 160,45 C160,41 153,38 150,38 Z',
    // Piece 4 — bottom left: top socket, right tab, flat bottom, flat left
    'M30,70 L53,70 C53,73 56,80 60,80 C64,80 67,73 67,70 L90,70 L90,88 C93,88 100,91 100,95 C100,99 93,102 90,102 L90,120 L30,120 Z',
    // Piece 5 — bottom mid: top tab, right tab, flat bottom, left socket
    'M90,70 L113,70 C113,67 116,60 120,60 C124,60 127,67 127,70 L150,70 L150,88 C153,88 160,91 160,95 C160,99 153,102 150,102 L150,120 L90,120 L90,102 C93,102 100,99 100,95 C100,91 93,88 90,88 Z',
  ]
  const opacities = [0.15, 0.18, 0.12, 0.2, 0.16]
  const strokeOps = [0.4, 0.45, 0.35, 0.5, 0.42]

  // Wrong piece 6 — has TAB on top (doesn't interlock with Piece 3's bottom tab)
  const wrongPath = 'M150,70 L173,70 C173,67 176,60 180,60 C184,60 187,67 187,70 L210,70 L210,120 L150,120 L150,102 C153,102 160,99 160,95 C160,91 153,88 150,88 Z'
  // Correct piece 6 — has SOCKET on top (interlocks perfectly)
  const correctPath = 'M150,70 L173,70 C173,73 176,80 180,80 C184,80 187,73 187,70 L210,70 L210,120 L150,120 L150,102 C153,102 160,99 160,95 C160,91 153,88 150,88 Z'

  return (
    <svg viewBox="0 0 240 180" fill="none" className="value-svg">
      {/* Grid outline */}
      <rect x="30" y="20" width="180" height="100" rx="2" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeDasharray="4 3" />

      {/* Placed pieces 1–5 */}
      {pieces.map((d, i) => (
        <path
          key={i}
          className="value-puzzle-placed"
          d={d}
          fill={`rgba(167,139,250,${opacities[i]})`}
          stroke={`rgba(167,139,250,${strokeOps[i]})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animationDelay: `${0.1 + i * 0.15}s` }}
        />
      ))}

      {/* Wrong piece — drops in, shakes, fades out with red flash */}
      <path className="value-puzzle-wrong" d={wrongPath} fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* X on wrong piece */}
      <g className="value-puzzle-x">
        <line x1="170" y1="83" x2="190" y2="107" stroke="rgba(239,68,68,0.6)" strokeWidth="2" strokeLinecap="round" />
        <line x1="190" y1="83" x2="170" y2="107" stroke="rgba(239,68,68,0.6)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Correct piece — slides in from right */}
      <path className="value-puzzle-correct" d={correctPath} fill="rgba(167,139,250,0.25)" stroke="rgba(167,139,250,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Checkmark on correct piece */}
      <path className="value-puzzle-check" d="M172,93 l6,8 l12,-14" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/* Card 04 — Foundation Blocks + Root System (pink #f472b6 accent) */
function FoundationAnimation() {
  const blocks = [
    { label: 'SYSTEM', fill: 'rgba(244,114,182,0.2)', stroke: 'rgba(244,114,182,0.45)' },
    { label: 'DOCS', fill: 'rgba(244,114,182,0.25)', stroke: 'rgba(244,114,182,0.5)' },
    { label: 'TRAINING', fill: 'rgba(244,114,182,0.18)', stroke: 'rgba(244,114,182,0.4)' },
    { label: 'OWNER', fill: 'rgba(244,114,182,0.3)', stroke: 'rgba(244,114,182,0.55)' },
  ]
  return (
    <svg viewBox="0 0 240 180" fill="none" className="value-svg">
      {/* Ground */}
      <line x1="42" y1="160" x2="174" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Blocks */}
      {blocks.map((b, i) => {
        const y = 160 - (i + 1) * 30
        return (
          <g key={i} className="value-foundation-block" style={{ animationDelay: `${0.2 + i * 0.3}s` }}>
            <rect x="60" y={y} width="91" height="26" rx="4" fill={b.fill} stroke={b.stroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            <text x="105" y={y + 17} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="8" fontFamily="JetBrains Mono, monospace">{b.label}</text>
          </g>
        )
      })}
      {/* Root system — grows downward from base after blocks land */}
      <path className="value-root-line" d="M80,160 C78,166 75,172 73,178" stroke="rgba(244,114,182,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path className="value-root-branch" d="M73,178 C71,180 69,181 67,180" stroke="rgba(244,114,182,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path className="value-root-branch" d="M73,178 C74,180 75,182 74,183" stroke="rgba(244,114,182,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />

      <path className="value-root-line" d="M98,160 C97,166 96,172 96,178" stroke="rgba(244,114,182,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path className="value-root-branch" d="M96,178 C94,180 93,182 91,182" stroke="rgba(244,114,182,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path className="value-root-branch" d="M96,178 C98,181 99,183 101,183" stroke="rgba(244,114,182,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />

      <path className="value-root-line" d="M120,160 C122,166 125,172 126,178" stroke="rgba(244,114,182,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path className="value-root-branch" d="M126,178 C124,180 123,181 121,182" stroke="rgba(244,114,182,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path className="value-root-branch" d="M126,178 C128,181 130,182 132,181" stroke="rgba(244,114,182,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />

      <path className="value-root-line" d="M107,160 C105,165 103,170 102,176" stroke="rgba(244,114,182,0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path className="value-root-branch" d="M102,176 C100,178 99,179 97,179" stroke="rgba(244,114,182,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* Card 05 — People + Level Bars (teal #5eead4 accent) */
function PeopleAnimation() {
  return (
    <svg viewBox="0 0 240 180" fill="none" className="value-svg">
      <defs>
        {[0, 1, 2].map((i) => (
          <linearGradient key={i} id={`lvlG${i}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5eead4" stopOpacity={`${0.1 + i * 0.05}`} />
            <stop offset="100%" stopColor="#5eead4" stopOpacity={`${0.45 + i * 0.1}`} />
          </linearGradient>
        ))}
      </defs>
      {[0, 1, 2].map((i) => {
        const cx = 66 + i * 54
        const barH = 24 + i * 17
        return (
          <g key={i}>
            {/* Head + shoulders */}
            <circle cx={cx} cy={114} r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d={`M${cx - 17},150 Q${cx - 17},134 ${cx - 6},129 Q${cx},127 ${cx},127 Q${cx},127 ${cx + 6},129 Q${cx + 17},134 ${cx + 17},150`}
              stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Bar bg */}
            <rect x={cx - 10} y="32" width="19" height="65" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            {/* Bar fill */}
            <rect
              className="value-level-bar"
              x={cx - 7} y={97 - barH} width="14" height={barH} rx="2"
              fill={`url(#lvlG${i})`} stroke="#5eead4" strokeWidth="0.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ animationDelay: `${0.3 + i * 0.25}s` }}
            />
            {/* Spark at bar top */}
            <circle
              className="value-spark"
              cx={cx} cy={97 - barH} r="3"
              fill="#5eead4"
              style={{ animationDelay: `${0.9 + i * 0.25}s` }}
            />
          </g>
        )
      })}
    </svg>
  )
}

/* Card 06 — Summit / Converging Lines UP (emerald #34d399 accent, smooth C bezier) */
function SummitAnimation() {
  return (
    <svg viewBox="0 0 240 180" fill="none" className="value-svg">
      {/* Left line — smooth cubic bezier to peak */}
      <path
        className="value-summit-left"
        d="M24,164 C48,148 72,108 84,84 S110,42 120,36"
        stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Right line — smooth cubic bezier to peak */}
      <path
        className="value-summit-right"
        d="M216,164 C192,148 168,108 156,84 S130,42 120,36"
        stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Peak pulse */}
      <circle className="value-summit-pulse" cx="120" cy="36" r="7" fill="rgba(52,211,153,0.3)" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" />
      <circle className="value-summit-ring" cx="120" cy="36" r="14" fill="none" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />

      {/* Flag at peak */}
      <g className="value-summit-flag">
        <line x1="120" y1="36" x2="120" y2="17" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="120,17 134,22 120,28" fill="rgba(52,211,153,0.3)" stroke="rgba(52,211,153,0.5)" strokeWidth="1" strokeLinejoin="round" />
      </g>

      {/* Shimmer traces */}
      <path className="value-summit-shimmer-l" d="M24,164 C48,148 72,108 84,84 S110,42 120,36" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path className="value-summit-shimmer-r" d="M216,164 C192,148 168,108 156,84 S130,42 120,36" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Labels */}
      <text x="12" y="178" fill="rgba(52,211,153,0.5)" fontSize="7" fontFamily="JetBrains Mono, monospace">YOUR METRICS</text>
      <text x="152" y="178" fill="rgba(52,211,153,0.35)" fontSize="7" fontFamily="JetBrains Mono, monospace">OUR MILESTONES</text>
    </svg>
  )
}

const ANIMATION_COMPONENTS = [
  BarsAnimation,
  DashboardAnimation,
  PuzzleAnimation,
  FoundationAnimation,
  PeopleAnimation,
  SummitAnimation,
]

/* ── Main Component ─────────────────────────── */

export default function ValueCarousel({ trigger }: { trigger: boolean }) {
  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const transitioningRef = useRef(false)
  const timelineRef = useRef<{ kill: () => void } | null>(null)

  /* ── Pixel dissolve transition ── */
  const goTo = useCallback(async (index: number) => {
    const clamped = Math.max(0, Math.min(index, VALUE_CARDS.length - 1))
    if (clamped === active || transitioningRef.current) return

    transitioningRef.current = true
    setTransitioning(true)
    const isNext = clamped > active

    const { default: gsap } = await import('gsap')
    const track = trackRef.current
    if (!track) return

    // Get current card pixel overlay elements
    const currentCard = track.children[active] as HTMLElement
    const currentBlocks = Array.from(currentCard.querySelectorAll('.value-pixel-block'))
    const currentScan = currentCard.querySelector('.value-scan-edge') as HTMLElement
    const sortedCurrent = isNext ? currentBlocks : [...currentBlocks].reverse()

    // Kill any lingering timeline
    timelineRef.current?.kill()
    const tl = gsap.timeline()
    timelineRef.current = tl as unknown as { kill: () => void }

    // Phase 1: Cover current card (0 – 0.4s)
    if (currentScan) {
      tl.fromTo(currentScan,
        { left: isNext ? '0%' : 'auto', right: isNext ? 'auto' : '0%', opacity: 1 },
        { left: isNext ? '100%' : 'auto', right: isNext ? 'auto' : '100%', duration: 0.4, ease: 'power3.inOut' },
        0,
      )
    }
    tl.to(sortedCurrent, {
      opacity: 1,
      duration: 0.008,
      stagger: 0.35 / sortedCurrent.length,
    }, 0)

    // Phase 2: Snap track (0.4s)
    tl.call(() => {
      // Update React state — track snaps because transition is 'none' (via transitioning flag)
      setActive(clamped)
      setAnimKey(k => k + 1)
    }, [], 0.45)

    // Phase 3: Uncover new card (0.65s – 1.05s)
    tl.call(() => {
      // Force reflow so React re-render has applied
      void track.offsetHeight

      const newCard = track.children[clamped] as HTMLElement
      const newBlocks = Array.from(newCard.querySelectorAll('.value-pixel-block'))
      const newScan = newCard.querySelector('.value-scan-edge') as HTMLElement
      const sortedNew = isNext ? newBlocks : [...newBlocks].reverse()

      // Ensure new card blocks are covering
      gsap.set(newBlocks, { opacity: 1 })

      // Scan bar on new card
      if (newScan) {
        gsap.fromTo(newScan,
          { left: isNext ? '0%' : 'auto', right: isNext ? 'auto' : '0%', opacity: 1 },
          { left: isNext ? '100%' : 'auto', right: isNext ? 'auto' : '100%', duration: 0.4, ease: 'power3.inOut' },
        )
      }

      // Reveal new card
      gsap.to(sortedNew, {
        opacity: 0,
        duration: 0.008,
        stagger: 0.35 / sortedNew.length,
        onComplete: () => {
          transitioningRef.current = false
          setTransitioning(false)
          // Clean up scan bars
          if (currentScan) gsap.set(currentScan, { opacity: 0 })
          if (newScan) gsap.set(newScan, { opacity: 0 })
        },
      })
    }, [], 0.65)
  }, [active])

  const prev = useCallback(() => goTo(active - 1), [active, goTo])
  const next = useCallback(() => goTo(active + 1), [active, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  // Touch swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      delta > 0 ? next() : prev()
    }
  }, [next, prev])

  // GSAP scroll entrance
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let tl: { kill: () => void } | null = null
    const run = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      tl = gsap.fromTo(el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
      ) as unknown as { kill: () => void }
    }
    run()
    return () => { tl?.kill() }
  }, [])

  // Cleanup GSAP timeline on unmount
  useEffect(() => {
    return () => { timelineRef.current?.kill() }
  }, [])

  const AnimComponent = ANIMATION_COMPONENTS[active]

  return (
    <div ref={containerRef} className="value-carousel-container" style={{ opacity: 0 }}>
      {/* Section header */}
      <div className="section-header section-title-reveal">
        <p className="value-eyebrow">THE DIFFERENCE</p>
        <TerminalText as="h2" trigger={trigger} duration={900}>
          How we ensure progression
        </TerminalText>
      </div>

      {/* Carousel */}
      <div
        className="value-carousel"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Left arrow */}
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={prev}
          disabled={active === 0 || transitioning}
          aria-label="Previous card"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Track */}
        <div className="value-carousel-viewport">
          <div
            ref={trackRef}
            className="value-carousel-track"
            style={{
              transform: `translateX(-${active * 100}%)`,
              transition: transitioning ? 'none' : undefined,
            }}
          >
            {VALUE_CARDS.map((card, i) => {
              const AnimComp = ANIMATION_COMPONENTS[i]
              return (
                <div
                  key={card.number}
                  className={`value-card blueprint-box ${i === active ? 'value-card-active' : ''}`}
                >
                  <div className="value-card-text">
                    <span className="value-card-number">{card.number}</span>
                    <h3 className="value-card-title">{card.title}</h3>
                    <p className="value-card-desc">{card.text}</p>
                  </div>
                  <div className="value-card-visual" key={i === active ? animKey : `static-${i}`}>
                    {i === active && <AnimComp />}
                  </div>
                  <ValuePixelOverlay seed={i} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right arrow */}
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={next}
          disabled={active === VALUE_CARDS.length - 1 || transitioning}
          aria-label="Next card"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="value-dots">
        {VALUE_CARDS.map((_, i) => (
          <button
            key={i}
            className={`testimonial-dot ${i === active ? 'active' : ''}`}
            onClick={() => goTo(i)}
            disabled={transitioning}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
