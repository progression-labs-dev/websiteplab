/**
 * CardIcon — Isidor-style white-stroke SVG line illustrations
 * Each icon is a minimal geometric design matching the card theme.
 */

const strokeProps = {
  stroke: 'white',
  strokeWidth: 1,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

// Method: Discover — concentric radar arcs
function DiscoverIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="4" {...strokeProps} strokeWidth={1.5} />
      <path d="M40 28 A12 12 0 0 1 52 40" {...strokeProps} />
      <path d="M40 22 A18 18 0 0 1 58 40" {...strokeProps} />
      <path d="M40 16 A24 24 0 0 1 64 40" {...strokeProps} />
      <line x1="40" y1="40" x2="56" y2="28" {...strokeProps} strokeWidth={0.8} opacity={0.5} />
    </svg>
  )
}

// Method: Design — blueprint grid dots
function DesignIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      {[20, 32, 44, 56].map(y =>
        [20, 32, 44, 56].map(x => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="white" opacity={0.6} />
        ))
      )}
      <rect x="18" y="18" width="40" height="40" {...strokeProps} opacity={0.3} />
      <line x1="32" y1="18" x2="32" y2="58" {...strokeProps} opacity={0.2} />
      <line x1="44" y1="18" x2="44" y2="58" {...strokeProps} opacity={0.2} />
      <line x1="18" y1="32" x2="58" y2="32" {...strokeProps} opacity={0.2} />
      <line x1="18" y1="44" x2="58" y2="44" {...strokeProps} opacity={0.2} />
    </svg>
  )
}

// Method: Build — horizontal code lines (stacked)
function BuildIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="24" x2="56" y2="24" {...strokeProps} opacity={0.7} />
      <line x1="20" y1="32" x2="48" y2="32" {...strokeProps} opacity={0.5} />
      <line x1="20" y1="40" x2="60" y2="40" {...strokeProps} opacity={0.8} />
      <line x1="20" y1="48" x2="44" y2="48" {...strokeProps} opacity={0.5} />
      <line x1="20" y1="56" x2="52" y2="56" {...strokeProps} opacity={0.6} />
      <polyline points="14,36 18,40 14,44" {...strokeProps} opacity={0.4} strokeWidth={0.8} />
    </svg>
  )
}

// Method: Scale — expanding chevrons upward
function ScaleIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <polyline points="28,52 40,40 52,52" {...strokeProps} opacity={0.8} />
      <polyline points="24,44 40,28 56,44" {...strokeProps} opacity={0.5} />
      <polyline points="20,36 40,16 60,36" {...strokeProps} opacity={0.3} />
      <line x1="40" y1="56" x2="40" y2="64" {...strokeProps} opacity={0.4} />
    </svg>
  )
}

// Service: AI Expert — connected neural nodes
function ExpertIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="28" r="4" {...strokeProps} />
      <circle cx="24" cy="52" r="4" {...strokeProps} />
      <circle cx="56" cy="52" r="4" {...strokeProps} />
      <line x1="40" y1="32" x2="24" y2="48" {...strokeProps} opacity={0.5} />
      <line x1="40" y1="32" x2="56" y2="48" {...strokeProps} opacity={0.5} />
      <line x1="28" y1="52" x2="52" y2="52" {...strokeProps} opacity={0.3} />
      <circle cx="40" cy="28" r="1.5" fill="white" opacity={0.6} />
      <circle cx="24" cy="52" r="1.5" fill="white" opacity={0.6} />
      <circle cx="56" cy="52" r="1.5" fill="white" opacity={0.6} />
    </svg>
  )
}

// Service: AI Builds — stacked layers / deploy
function BuildsIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="52" rx="20" ry="8" {...strokeProps} opacity={0.4} />
      <ellipse cx="40" cy="42" rx="20" ry="8" {...strokeProps} opacity={0.6} />
      <ellipse cx="40" cy="32" rx="20" ry="8" {...strokeProps} opacity={0.8} />
      <line x1="20" y1="32" x2="20" y2="52" {...strokeProps} opacity={0.3} />
      <line x1="60" y1="32" x2="60" y2="52" {...strokeProps} opacity={0.3} />
    </svg>
  )
}

// Service: AI Transformation — morphing arrows
function TransformIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 36 L40 20 L56 36" {...strokeProps} opacity={0.5} />
      <path d="M24 44 L40 60 L56 44" {...strokeProps} opacity={0.5} />
      <line x1="40" y1="20" x2="40" y2="60" {...strokeProps} opacity={0.3} />
      <polyline points="36,24 40,20 44,24" {...strokeProps} opacity={0.7} />
      <polyline points="36,56 40,60 44,56" {...strokeProps} opacity={0.7} />
    </svg>
  )
}

// Service: AI Audit — checkmark in bordered circle
function AuditIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="20" {...strokeProps} opacity={0.5} />
      <polyline points="28,40 36,48 52,32" {...strokeProps} strokeWidth={1.5} opacity={0.8} />
    </svg>
  )
}

// Service: Project Surgery — wrench/cross tool
function SurgeryIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <line x1="28" y1="28" x2="52" y2="52" {...strokeProps} opacity={0.7} />
      <line x1="52" y1="28" x2="28" y2="52" {...strokeProps} opacity={0.7} />
      <circle cx="40" cy="40" r="12" {...strokeProps} opacity={0.3} />
      <circle cx="28" cy="28" r="3" {...strokeProps} opacity={0.5} />
      <circle cx="52" cy="52" r="3" {...strokeProps} opacity={0.5} />
    </svg>
  )
}

// Service: Ideation — radiating lightbulb
function IdeationIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="36" r="12" {...strokeProps} opacity={0.6} />
      <line x1="36" y1="48" x2="44" y2="48" {...strokeProps} opacity={0.5} />
      <line x1="37" y1="52" x2="43" y2="52" {...strokeProps} opacity={0.4} />
      <line x1="40" y1="16" x2="40" y2="20" {...strokeProps} opacity={0.4} />
      <line x1="56" y1="36" x2="60" y2="36" {...strokeProps} opacity={0.4} />
      <line x1="20" y1="36" x2="24" y2="36" {...strokeProps} opacity={0.4} />
      <line x1="52" y1="24" x2="55" y2="21" {...strokeProps} opacity={0.3} />
      <line x1="28" y1="24" x2="25" y2="21" {...strokeProps} opacity={0.3} />
    </svg>
  )
}

const iconMap: Record<string, () => JSX.Element> = {
  discover: DiscoverIcon,
  design: DesignIcon,
  build: BuildIcon,
  scale: ScaleIcon,
  expert: ExpertIcon,
  builds: BuildsIcon,
  transform: TransformIcon,
  audit: AuditIcon,
  surgery: SurgeryIcon,
  ideation: IdeationIcon,
}

export default function CardIcon({ name }: { name: string }) {
  const Icon = iconMap[name]
  if (!Icon) return null
  return (
    <div className="exp-panel-icon" data-icon={name}>
      <Icon />
    </div>
  )
}
