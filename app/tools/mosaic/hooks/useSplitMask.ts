import { useState, useCallback, useRef, useEffect } from 'react';

export interface SplitState {
  position: number;  // 0-1
  angle: number;     // degrees
  enabled: boolean;
  isDragging: boolean;
}

export function useSplitMask(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [split, setSplit] = useState<SplitState>({
    position: 0.5,
    angle: 45,
    enabled: true,
    isDragging: false,
  });

  const dragging = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    setSplit(s => ({ ...s, isDragging: true }));
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const angle = split.angle;

    // For diagonal/horizontal split, use X position; for vertical, use Y
    let pos: number;
    if (Math.abs(angle) < 10 || Math.abs(angle - 180) < 10) {
      // ~horizontal: use Y
      pos = (e.clientY - rect.top) / rect.height;
    } else if (Math.abs(angle - 90) < 10 || Math.abs(angle - 270) < 10) {
      // ~vertical: use X
      pos = (e.clientX - rect.left) / rect.width;
    } else {
      // diagonal: use average of X and Y position
      const xPos = (e.clientX - rect.left) / rect.width;
      const yPos = (e.clientY - rect.top) / rect.height;
      pos = (xPos + yPos) / 2;
    }

    pos = Math.min(1, Math.max(0, pos));
    setSplit(s => ({ ...s, position: pos }));
  }, [canvasRef, split.angle]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    setSplit(s => ({ ...s, isDragging: false }));
  }, []);

  const setPosition = useCallback((position: number) => {
    setSplit(s => ({ ...s, position }));
  }, []);

  const setAngle = useCallback((angle: number) => {
    setSplit(s => ({ ...s, angle }));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setSplit(s => ({ ...s, enabled }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { dragging.current = false; };
  }, []);

  return {
    split,
    setPosition,
    setAngle,
    setEnabled,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
