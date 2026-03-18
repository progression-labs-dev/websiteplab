'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, MouseEvent } from 'react';
import { ImageBuffer } from '../../mosaic/utils/imageProcessing';
import { AsciiGradientParams } from '../hooks/useAsciiGradientRenderer';
import { useAsciiGradientRenderer } from '../hooks/useAsciiGradientRenderer';

interface ClickPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

interface AsciiGradientCanvasProps {
  buffer: ImageBuffer | null;
  params: AsciiGradientParams;
  subjectMask?: Uint8Array | null;
  onCanvasClick?: (x: number, y: number, label: 0 | 1) => void;
  clickPoints?: ClickPoint[];
}

export interface AsciiGradientCanvasHandle {
  exportPNG: () => void;
}

const AsciiGradientCanvas = forwardRef<AsciiGradientCanvasHandle, AsciiGradientCanvasProps>(
  function AsciiGradientCanvas({ buffer, params, subjectMask, onCanvasClick, clickPoints }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { render, cleanup } = useAsciiGradientRenderer();

    // Re-render when params, buffer, or mask change
    useEffect(() => {
      if (!buffer || !canvasRef.current) return;
      render(canvasRef.current, buffer, params, subjectMask);
    }, [buffer, params, subjectMask, render]);

    useEffect(() => cleanup, [cleanup]);

    // Convert CSS click coordinates to image-space coordinates
    // Accounts for object-fit:contain letterboxing
    const cssToImageCoords = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const canvasAspect = canvas.width / canvas.height;
      const elemAspect = rect.width / rect.height;

      let renderW: number, renderH: number, offsetX: number, offsetY: number;
      if (canvasAspect > elemAspect) {
        renderW = rect.width;
        renderH = rect.width / canvasAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
      } else {
        renderH = rect.height;
        renderW = rect.height * canvasAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
      }

      const cssX = e.clientX - rect.left - offsetX;
      const cssY = e.clientY - rect.top - offsetY;

      if (cssX < 0 || cssX > renderW || cssY < 0 || cssY > renderH) return null;

      const imageX = Math.round((cssX / renderW) * canvas.width);
      const imageY = Math.round((cssY / renderH) * canvas.height);

      return { imageX, imageY, renderW, renderH, offsetX, offsetY };
    }, []);

    // Left-click = foreground (include in subject)
    const handleClick = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      if (!onCanvasClick) return;
      const coords = cssToImageCoords(e);
      if (!coords) return;
      onCanvasClick(coords.imageX, coords.imageY, 1);
    }, [onCanvasClick, cssToImageCoords]);

    // Right-click = background (exclude from subject)
    const handleContextMenu = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      if (!onCanvasClick) return;
      e.preventDefault();
      const coords = cssToImageCoords(e);
      if (!coords) return;
      onCanvasClick(coords.imageX, coords.imageY, 0);
    }, [onCanvasClick, cssToImageCoords]);

    // PNG export at full resolution via toBlob
    const exportPNG = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `ascii-gradient-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    }, []);

    useImperativeHandle(ref, () => ({ exportPNG }), [exportPNG]);

    // Compute dot positions for click point overlay
    const dotPositions = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !buffer || !clickPoints?.length) return [];

      const rect = canvas.getBoundingClientRect();
      const canvasAspect = canvas.width / canvas.height;
      const elemAspect = rect.width / rect.height;
      let renderW: number, renderH: number, offsetX: number, offsetY: number;
      if (canvasAspect > elemAspect) {
        renderW = rect.width;
        renderH = rect.width / canvasAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
      } else {
        renderH = rect.height;
        renderW = rect.height * canvasAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
      }

      return clickPoints.map(pt => ({
        left: offsetX + (pt.x / canvas.width) * renderW,
        top: offsetY + (pt.y / canvas.height) * renderH,
        label: pt.label,
      }));
    }, [buffer, clickPoints]);

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            cursor: 'crosshair',
          }}
        />
        {clickPoints && clickPoints.length > 0 && dotPositions().map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: dot.left - 5,
              top: dot.top - 5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: dot.label === 1 ? 'rgba(0,200,0,0.8)' : 'rgba(255,0,0,0.8)',
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    );
  }
);

export default AsciiGradientCanvas;
