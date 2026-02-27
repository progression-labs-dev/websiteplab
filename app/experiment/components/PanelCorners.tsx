/** Four 12px SVG L-bracket corners (Isidor .card_icon-corner) */
export default function PanelCorners() {
  const corner = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 12V0H12" stroke="currentColor" strokeWidth="1" />
    </svg>
  )

  return (
    <>
      <span className="exp-corner exp-corner--tl" aria-hidden="true">{corner}</span>
      <span className="exp-corner exp-corner--tr" aria-hidden="true">{corner}</span>
      <span className="exp-corner exp-corner--bl" aria-hidden="true">{corner}</span>
      <span className="exp-corner exp-corner--br" aria-hidden="true">{corner}</span>
    </>
  )
}
