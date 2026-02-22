'use client'

interface VideoCarouselProps {
  isActive: boolean
}

export default function VideoCarousel({ isActive }: VideoCarouselProps) {
  return (
    <div className="video-carousel">
      <video
        src="/flower_open.mov"
        className={isActive ? 'active' : ''}
        muted
        autoPlay
        loop
        playsInline
      />
    </div>
  )
}
