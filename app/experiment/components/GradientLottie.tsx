'use client'

import React, { useRef, useEffect, useState } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

interface GradientLottieProps {
  src: string | object
  size?: number
}

/**
 * GradientLottie — White-to-blue gradient Lottie for dark backgrounds.
 *
 * Injects an SVG <linearGradient> into the Lottie's rendered SVG and
 * applies it to all fill/stroke elements. Uses MutationObserver to
 * persist through animation frame updates. Forces opacity: 1 to
 * override the default 0.7 on .exp-panel-icon svg.
 */
let gradCounter = 0

export default function GradientLottie({ src, size = 80 }: GradientLottieProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [animData, setAnimData] = useState<object | null>(null)
  const gradId = useRef(`lottie-grad-${++gradCounter}`)

  useEffect(() => {
    if (typeof src === 'string') {
      fetch(src)
        .then(r => r.json())
        .then(setAnimData)
        .catch(() => {})
    } else {
      setAnimData(src)
    }
  }, [src])

  // Inject SVG gradient and maintain via MutationObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el || !animData) return

    let observer: MutationObserver | null = null
    let applying = false

    // Find the Lottie SVG — skip PanelCorners (12x12 viewBox)
    const findLottieSvg = (): SVGSVGElement | null => {
      const svgs = Array.from(el.querySelectorAll('svg'))
      for (const svg of svgs) {
        const vb = svg.getAttribute('viewBox') || ''
        if (!vb.includes('0 0 12 12')) return svg
      }
      return null
    }

    const applyGradient = () => {
      if (applying) return
      applying = true

      const svg = findLottieSvg()
      if (!svg) { applying = false; return }

      // Override CSS opacity: 0.7 from .exp-panel-icon svg
      svg.style.opacity = '1'

      // Get viewBox dimensions for userSpaceOnUse coordinates
      const vb = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 100, 100]
      const vbH = vb[3]

      // Inject gradient defs if not present
      const gid = gradId.current
      if (!svg.querySelector(`#${gid}`)) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        defs.innerHTML = `
          <linearGradient id="${gid}" gradientUnits="userSpaceOnUse"
            x1="0" y1="${vbH}" x2="0" y2="0">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="35%" stop-color="#5B9BD5" />
            <stop offset="100%" stop-color="#0A3D8F" />
          </linearGradient>
        `
        svg.insertBefore(defs, svg.firstChild)
      }

      // Apply gradient to all shape elements
      const gradUrl = `url(#${gid})`
      const shapes = svg.querySelectorAll('path, rect, circle, ellipse, polygon, polyline')
      shapes.forEach(shape => {
        const s = shape as SVGElement
        const fill = s.getAttribute('fill') || s.style.fill
        if (fill !== 'none' && fill !== 'transparent' && s.style.fill !== gradUrl) {
          s.style.fill = gradUrl
        }
        const stroke = s.getAttribute('stroke') || s.style.stroke
        if (stroke && stroke !== 'none' && stroke !== 'transparent' && s.style.stroke !== gradUrl) {
          s.style.stroke = gradUrl
        }
      })

      applying = false
    }

    // Apply after Lottie renders, then watch for changes
    const timer = setTimeout(() => {
      applyGradient()

      const svg = findLottieSvg()
      if (svg) {
        observer = new MutationObserver(() => applyGradient())
        observer.observe(svg, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['fill'],
        })
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [animData])

  // Play on hover via parent .exp-panel
  useEffect(() => {
    const panel = containerRef.current?.closest('.exp-panel')
    if (!panel) return
    const handleEnter = () => lottieRef.current?.play()
    const handleLeave = () => lottieRef.current?.goToAndStop(0, true)
    panel.addEventListener('mouseenter', handleEnter)
    panel.addEventListener('mouseleave', handleLeave)
    return () => {
      panel.removeEventListener('mouseenter', handleEnter)
      panel.removeEventListener('mouseleave', handleLeave)
    }
  }, [animData])

  // Play on scroll into view
  useEffect(() => {
    const el = containerRef.current
    if (!el || !animData) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) lottieRef.current?.play()
        else lottieRef.current?.goToAndStop(0, true)
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animData])

  return (
    <div ref={containerRef} style={{ width: size, height: size }}>
      {animData && (
        <Lottie
          lottieRef={lottieRef}
          animationData={animData}
          loop={true}
          autoplay={false}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}
