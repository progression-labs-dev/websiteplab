'use client';

import { useRef } from 'react';
import './hero-lab.css';
import { useGradientCircles } from './useGradientCircles';

export default function HeroLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGradientCircles(canvasRef);

  return (
    <div className="hero-lab">
      {/* Layer 1: CSS gradient blobs (visible through gaps between circles) */}
      <div className="gradient-layer">
        <div className="blob blob-orchid" />
        <div className="blob blob-salmon" />
        <div className="blob blob-orange" />
        <div className="blob blob-blue" />
        <div className="blob blob-turquoise" />
        <div className="blob blob-green" />
        <div className="blob blob-orchid-secondary" />
        <div className="blob blob-salmon-secondary" />
        <div className="blob blob-orange-secondary" />
        <div className="blob blob-turquoise-secondary" />
        <div className="blob blob-green-secondary" />
      </div>

      {/* Layer 2: Canvas circle grid overlay (frosted glass effect) */}
      <canvas
        ref={canvasRef}
        className="circle-canvas"
      />
    </div>
  );
}
