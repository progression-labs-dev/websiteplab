'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, MouseEvent } from 'react';
import { ImageBuffer } from '../utils/imageProcessing';
import { MosaicParams, MaskMode } from '../hooks/useMosaicRenderer';
import { useMosaicRenderer } from '../hooks/useMosaicRenderer';

interface ClickPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

interface MosaicCanvasProps {
  buffer: ImageBuffer | null;
  params: MosaicParams;
  splitPosition: number;
  splitAngle: number;
  onSplitDrag?: (position: number) => void;
  subjectMask?: Uint8Array | null;
  onCanvasClick?: (x: number, y: number, label: 0 | 1) => void;
  clickPoints?: ClickPoint[];
}

export interface MosaicCanvasHandle {
  exportPNG: () => void;
}

const MosaicCanvas = forwardRef<MosaicCanvasHandle, MosaicCanvasProps>(
  function MosaicCanvas({ buffer, params, subjectMask, onCanvasClick, clickPoints }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { render, renderAnimated, cleanup } = useMosaicRenderer();

    // Re-render when params, buffer, or mask change.
    // Call render() directly (not renderAnimated) — React already batches state updates,
    // so by the time the effect fires all changes are applied. Direct rendering fixes
    // video playback where RAF-deferred renders could be cancelled by the next frame.
    useEffect(() => {
      if (!buffer || !canvasRef.current) return;
      render(canvasRef.current, buffer, params, subjectMask);
    }, [buffer, params, subjectMask, render]);

    // Cleanup on unmount
    useEffect(() => cleanup, [cleanup]);

    // Convert CSS click coordinates to image-space coordinates
    // Accounts for object-fit:contain letterboxing
    const cssToImageCoords = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      // Compute rendered image area within the canvas element (object-fit:contain)
      const canvasAspect = canvas.width / canvas.height;
      const elemAspect = rect.width / rect.height;

      let renderW: number, renderH: number, offsetX: number, offsetY: number;
      if (canvasAspect > elemAspect) {
        // Image wider than element — letterbox top/bottom
        renderW = rect.width;
        renderH = rect.width / canvasAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
      } else {
        // Image taller than element — letterbox left/right
        renderH = rect.height;
        renderW = rect.height * canvasAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
      }

      const cssX = e.clientX - rect.left - offsetX;
      const cssY = e.clientY - rect.top - offsetY;

      // Clamp to rendered area
      if (cssX < 0 || cssX > renderW || cssY < 0 || cssY > renderH) return null;

      const imageX = Math.round((cssX / renderW) * canvas.width);
      const imageY = Math.round((cssY / renderH) * canvas.height);

      return { imageX, imageY, renderW, renderH, offsetX, offsetY };
    }, []);

    // Handle canvas clicks in subject mode
    const handleClick = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      if (params.maskMode !== 'subject' || !onCanvasClick) return;

      const coords = cssToImageCoords(e);
      if (!coords) return;

      // Left-click = foreground (1), don't handle right-click here (use contextmenu)
      onCanvasClick(coords.imageX, coords.imageY, 1);
    }, [params.maskMode, onCanvasClick, cssToImageCoords]);

    // Right-click = background (0)
    const handleContextMenu = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
      if (params.maskMode !== 'subject' || !onCanvasClick) return;

      e.preventDefault();
      const coords = cssToImageCoords(e);
      if (!coords) return;

      onCanvasClick(coords.imageX, coords.imageY, 0);
    }, [params.maskMode, onCanvasClick, cssToImageCoords]);

    // Export handler
    const exportPNG = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `mosaic-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }, []);

    useImperativeHandle(ref, () => ({ exportPNG }), [exportPNG]);

    // Compute dot positions in CSS space for the point overlay
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

      return clickPoints.map(p => ({
        left: offsetX + (p.x / canvas.width) * renderW,
        top: offsetY + (p.y / canvas.height) * renderH,
        label: p.label,
      }));
    }, [buffer, clickPoints]);

    // Canvas display sizing
    const displayStyle: React.CSSProperties = buffer
      ? {
          width: '100%',
          height: '100%',
          objectFit: 'contain' as const,
        }
      : {};

    const isSubjectMode = params.maskMode === 'subject';

    return (
      <div ref={containerRef} className="mosaic-canvas-container">
        {buffer ? (
          <>
            <canvas
              ref={canvasRef}
              style={{
                ...displayStyle,
                cursor: isSubjectMode ? 'crosshair' : undefined,
              }}
              onClick={handleClick}
              onContextMenu={handleContextMenu}
            />
            {/* Click point overlay dots */}
            {isSubjectMode && clickPoints && clickPoints.length > 0 && (
              <div className="mosaic-click-dots">
                {dotPositions().map((dot, i) => (
                  <div
                    key={i}
                    className={`mosaic-click-dot ${dot.label === 1 ? 'foreground' : 'background'}`}
                    style={{ left: dot.left, top: dot.top }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mosaic-upload-prompt">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="2" />
              <path d="M8 44l12-12 8 8 12-16 16 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <p>Drop an image here or use the sidebar to upload</p>
            <span>Supports JPG, PNG, WebP, MP4, WebM</span>
          </div>
        )}
      </div>
    );
  }
);

export default MosaicCanvas;
