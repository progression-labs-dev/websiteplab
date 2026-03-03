/** Four 16px CSS border-joint corners — no SVGs, no rotation, perfectly flush */
export default function PanelCorners() {
  return (
    <>
      <span className="exp-corner exp-corner--tl" aria-hidden="true" />
      <span className="exp-corner exp-corner--tr" aria-hidden="true" />
      <span className="exp-corner exp-corner--bl" aria-hidden="true" />
      <span className="exp-corner exp-corner--br" aria-hidden="true" />
    </>
  )
}
