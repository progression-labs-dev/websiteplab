'use client'

const teamMembers = [
  { name: 'Gabor Soter', role: 'CEO & Co-founder', gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
  { name: 'Joe O\'Meara', role: 'CTO & Co-founder', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { name: 'Elena Vasquez', role: 'Senior AI Engineer', gradient: 'linear-gradient(135deg, #14b8a6, #10b981)' },
  { name: 'Marcus Chen', role: 'Head of Product', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { name: 'Sarah Okafor', role: 'ML Research Lead', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { name: 'David Kim', role: 'Senior Platform Engineer', gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
  { name: 'Anna Kowalski', role: 'AI Solutions Architect', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { name: 'James Mwangi', role: 'Data Engineering Lead', gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
]

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const COLS = 8
const ROWS = 10
const TOTAL_BLOCKS = COLS * ROWS // 80

// Simple integer hash for deterministic pseudo-random noise per block
function hashNoise(col: number, row: number, cardIndex: number): number {
  let h = (cardIndex * 7919 + col * 131 + row * 524287) | 0
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = (h >> 16) ^ h
  return (h & 0x7fffffff) / 0x7fffffff // 0..1
}

// Pre-compute sorted block indices per card so GSAP's sequential stagger
// naturally produces the noisy L→R sweep.
function buildSortedBlocks(cardIndex: number): { col: number; row: number; threshold: number }[] {
  const blocks: { col: number; row: number; threshold: number }[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const noise = hashNoise(c, r, cardIndex)
      const wipe = c / (COLS - 1) // 0 at left, 1 at right
      const threshold = noise * 0.4 + wipe * 0.6
      blocks.push({ col: c, row: r, threshold })
    }
  }
  blocks.sort((a, b) => a.threshold - b.threshold)
  return blocks
}

function PixelOverlay({ cardIndex }: { cardIndex: number }) {
  const sortedBlocks = buildSortedBlocks(cardIndex)

  return (
    <div className="team-card-pixel-overlay">
      {sortedBlocks.map((block, i) => (
        <div
          key={i}
          className="pixel-block"
          style={{
            left: `${(block.col / COLS) * 100}%`,
            top: `${(block.row / ROWS) * 100}%`,
            width: `${100 / COLS}%`,
            height: `${100 / ROWS}%`,
          }}
        />
      ))}
      <div className="team-card-scan-edge" />
    </div>
  )
}

export default function TeamGrid() {
  return (
    <div className="team-grid">
      {teamMembers.map((member, i) => (
        <div className="team-card" key={i} style={{ opacity: 0 }}>
          <div
            className="team-avatar"
            style={{ background: member.gradient }}
          >
            <span className="team-initials">{getInitials(member.name)}</span>
          </div>
          <div className="team-card-name">{member.name}</div>
          <div className="team-card-role">{member.role}</div>
          <PixelOverlay cardIndex={i} />
        </div>
      ))}
    </div>
  )
}
