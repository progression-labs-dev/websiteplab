'use client'

interface VideoCarouselProps {
  isActive: boolean
}

export default function VideoCarousel({ isActive }: VideoCarouselProps) {
  return (
    <div className="video-carousel">
      <video
        src="/blue-flower-no-background.mp4"
        className={isActive ? 'active' : ''}
        muted
        autoPlay
        loop
        playsInline
      />
    </div>
  )
}
