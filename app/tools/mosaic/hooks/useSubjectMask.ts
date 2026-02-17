import { useState, useCallback, useRef } from 'react';
import type { ImageBuffer } from '../utils/imageProcessing';
import type { PointPrompt, ImageEmbeddings, SAMLoadProgress } from '../utils/samSegmenter';

export interface SubjectMaskState {
  /** Binary mask: 1 = foreground (apply effect), 0 = background. Null until first decode. */
  mask: Uint8Array | null;
  /** Accumulated click points used to generate the mask. */
  points: PointPrompt[];
  /** True while the model files are being downloaded/loaded into memory. */
  isLoading: boolean;
  /** True while the image encoder is running (~1-2s). */
  isEncoding: boolean;
  /** True while the mask decoder is running (~50ms). */
  isDecoding: boolean;
  /** Model download progress (0-100). */
  loadProgress: number;
}

export function useSubjectMask() {
  const [mask, setMask] = useState<Uint8Array | null>(null);
  const [points, setPoints] = useState<PointPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEncoding, setIsEncoding] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Cache embeddings so we only re-encode when the image changes
  const embeddingsRef = useRef<ImageEmbeddings | null>(null);
  // Track which buffer was encoded to detect image changes
  const encodedBufferRef = useRef<ImageBuffer | null>(null);
  // Track image size for mask dimensions
  const imageSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  // Debounce timer for rapid clicks
  const decodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirror of points to avoid stale closures in addPoint/removeLastPoint
  const pointsRef = useRef<PointPrompt[]>([]);

  /**
   * Loads the SAM model (downloads ~25MB on first use, cached in IndexedDB after).
   */
  const initModel = useCallback(async () => {
    setIsLoading(true);
    setLoadProgress(0);
    try {
      const { loadSAM } = await import('../utils/samSegmenter');
      await loadSAM((info: SAMLoadProgress) => {
        if (typeof info.progress === 'number') {
          setLoadProgress(Math.round(info.progress));
        }
      });
    } finally {
      setIsLoading(false);
      setLoadProgress(100);
    }
  }, []);

  /**
   * Runs the image encoder. Caches result so subsequent calls with the same
   * buffer are no-ops. Call this when an image is uploaded or when switching
   * to subject mask mode.
   */
  const encodeImage = useCallback(async (buffer: ImageBuffer) => {
    // Skip if already encoded this exact buffer
    if (encodedBufferRef.current === buffer && embeddingsRef.current) return;

    setIsEncoding(true);
    try {
      const { encodeImage: encode } = await import('../utils/samSegmenter');
      const embeddings = await encode(buffer);
      embeddingsRef.current = embeddings;
      encodedBufferRef.current = buffer;
      imageSizeRef.current = { width: buffer.width, height: buffer.height };
    } finally {
      setIsEncoding(false);
    }
  }, []);

  /**
   * Runs the mask decoder with the current points. Called internally
   * whenever points change.
   */
  const runDecoder = useCallback(async (currentPoints: PointPrompt[]) => {
    if (!embeddingsRef.current) return;
    if (currentPoints.length === 0) {
      setMask(null);
      return;
    }

    setIsDecoding(true);
    try {
      const { decodeMask } = await import('../utils/samSegmenter');
      const result = await decodeMask(
        embeddingsRef.current,
        currentPoints,
        imageSizeRef.current
      );
      setMask(result);
    } finally {
      setIsDecoding(false);
    }
  }, []);

  /**
   * Adds a point and triggers mask generation.
   * label: 1 = include (foreground), 0 = exclude (background)
   */
  const addPoint = useCallback((x: number, y: number, label: 0 | 1) => {
    const newPoint: PointPrompt = { x, y, label };
    const newPoints = [...pointsRef.current, newPoint];
    pointsRef.current = newPoints;
    setPoints(newPoints);

    // Debounce rapid clicks: cancel pending decode, schedule new one
    if (decodeTimerRef.current) {
      clearTimeout(decodeTimerRef.current);
    }
    decodeTimerRef.current = setTimeout(() => {
      runDecoder(pointsRef.current);
    }, 50);
  }, [runDecoder]);

  /**
   * Removes the last point and re-generates the mask.
   */
  const removeLastPoint = useCallback(async () => {
    const newPoints = pointsRef.current.slice(0, -1);
    pointsRef.current = newPoints;
    setPoints(newPoints);
    await runDecoder(newPoints);
  }, [runDecoder]);

  /**
   * Clears all points and the mask.
   */
  const clearMask = useCallback(() => {
    pointsRef.current = [];
    setPoints([]);
    setMask(null);
    if (decodeTimerRef.current) {
      clearTimeout(decodeTimerRef.current);
    }
  }, []);

  /**
   * Inverts the current mask (foreground <-> background).
   */
  const invertMask = useCallback(() => {
    if (!mask) return;
    const inverted = new Uint8Array(mask.length);
    for (let i = 0; i < mask.length; i++) {
      inverted[i] = mask[i] === 1 ? 0 : 1;
    }
    setMask(inverted);
  }, [mask]);

  return {
    // State
    mask,
    points,
    isLoading,
    isEncoding,
    isDecoding,
    loadProgress,
    // Methods
    initModel,
    encodeImage,
    addPoint,
    removeLastPoint,
    clearMask,
    invertMask,
  };
}
