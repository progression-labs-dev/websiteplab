'use client'

const logos = [
  { src: '/logos/palantir.svg', alt: 'Palantir' },
  { src: '/logos/spotify.png', alt: 'Spotify' },
  { src: '/logos/mckinsey.png', alt: 'McKinsey' },
  { src: '/logos/quantumblack.png', alt: 'QuantumBlack' },
  { src: '/logos/contractor-commerce.png', alt: 'Contractor Commerce' },
  { src: '/logos/bwe.png', alt: 'BWE' },
  { src: '/logos/globo.jpg', alt: 'Globo' },
  { src: '/logos/ib.png', alt: 'IB' },
]

/** Single set of logos with vertical dividers between each */
function LogoStrip() {
  return (
    <>
      {logos.map((logo, i) => (
        <div key={i} className="exp-marquee-item">
          <div className="exp-marquee-divider" />
          <img
            src={logo.src}
            alt={logo.alt}
            draggable={false}
          />
        </div>
      ))}
    </>
  )
}

export default function LogoMarquee() {
  return (
    <>
      {/* Isidor-style label tag */}
      <div className="exp-logo-carousel-label">
        <div className="exp-tag">With team members from</div>
      </div>

      {/* Infinite auto-scrolling CSS marquee with edge fade masks */}
      <div className="exp-marquee">
        <div className="exp-marquee-track">
          <LogoStrip />
          <LogoStrip />
        </div>
      </div>
    </>
  )
}
