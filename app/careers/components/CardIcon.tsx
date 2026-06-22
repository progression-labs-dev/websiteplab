// Geometric line icons for the value / benefit cards. Circle-led to echo the
// brand's perfect-circle logo system. One element per icon carries a `cz-spin`
// or `cz-shift` class so the parent .careers-card hover animates it.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export default function CardIcon({ name }: { name: string }) {
  switch (name) {
    case 'agency': // target + arrow
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="20" r="13" />
          <circle className="cz-spin" cx="20" cy="20" r="5" />
          <path className="cz-shift" d="M20 20 32 8M32 8h-7M32 8v7" />
        </svg>
      )
    case 'ownership': // concentric — owned end to end
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="20" r="14" />
          <circle cx="20" cy="20" r="8" />
          <circle className="cz-spin" cx="20" cy="20" r="2.4" fill="currentColor" />
        </svg>
      )
    case 'speed': // circle + motion lines
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="23" cy="20" r="11" />
          <g className="cz-shift">
            <path d="M4 14h9M2 20h7M5 26h8" />
          </g>
        </svg>
      )
    case 'lean': // minus — no fat
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="20" r="14" />
          <path className="cz-shift" d="M13 20h14" />
        </svg>
      )
    case 'equity': // split circle — shared ownership
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="20" r="14" />
          <path d="M20 6v28" />
          <path className="cz-spin" d="M20 20 30 14" />
        </svg>
      )
    case 'health': // plus in circle
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="20" r="14" />
          <path className="cz-spin" d="M20 13v14M13 20h14" />
        </svg>
      )
    case 'time': // clock
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="20" r="14" />
          <path className="cz-spin" d="M20 12v8l6 4" />
        </svg>
      )
    case 'offsite': // two linked circles
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="14" cy="20" r="8" />
          <circle className="cz-shift" cx="28" cy="20" r="8" />
        </svg>
      )
    case 'office': // circle with a base line (a place)
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="17" r="11" />
          <path className="cz-shift" d="M8 34h24" />
        </svg>
      )
    case 'learning': // open arcs — a book
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <path d="M20 12c-4-3-9-3-13-1v18c4-2 9-2 13 1" />
          <path className="cz-shift" d="M20 12c4-3 9-3 13-1v18c-4-2-9-2-13 1" />
          <path d="M20 12v18" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 40 40" {...S}>
          <circle cx="20" cy="20" r="13" />
        </svg>
      )
  }
}
