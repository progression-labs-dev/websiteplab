/** Four 8px SVG L-bracket corners (Isidor .card_icon-corner) */
export default function PanelCorners() {
  const corner = (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 8V0H8" stroke="currentColor" strokeWidth="1" />
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
