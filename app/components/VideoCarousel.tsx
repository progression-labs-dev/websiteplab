'use client'

import { useEffect, useState, useRef } from 'react'

const VIDEOS = [
  '/green-rocket.mp4',
  '/green-flower.mp4',
  '/orange-jellyfish.mp4',
]

const CYCLE_INTERVAL = 6000 // 6 seconds between transitions

interface VideoCarouselProps {
  isActive: boolean
}

export default function VideoCarousel({ isActive }: VideoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isActive) return

    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % VIDEOS.length)
    }, CYCLE_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  return (
    <div className="video-carousel">
      {VIDEOS.map((src, index) => (
        <video
          key={src}
          src={src}
          className={index === activeIndex ? 'active' : ''}
          muted
          autoPlay
          loop
          playsInline
        />
      ))}
    </div>
  )
}
