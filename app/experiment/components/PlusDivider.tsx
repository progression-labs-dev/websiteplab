/**
 * PlusDivider — Isidor-style section divider with centered + symbol
 *
 * Horizontal 1px line with a centered + mark.
 * Purely decorative, replacing generic <hr> elements.
 */

export default function PlusDivider() {
  return (
    <div className="exp-plus-divider" aria-hidden="true">
      <span className="exp-plus-divider-mark">+</span>
    </div>
  )
}
