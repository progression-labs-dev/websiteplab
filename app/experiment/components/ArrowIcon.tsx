/**
 * ArrowIcon — Isidor-style inline SVG arrow for buttons
 *
 * Replaces → HTML entity with a clean, scalable SVG arrow.
 * Animates on hover via CSS (parent .exp-btn-filled:hover .exp-arrow-icon)
 */

export default function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`exp-arrow-icon ${className || ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 6H11M11 6L6.5 1.5M11 6L6.5 10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
