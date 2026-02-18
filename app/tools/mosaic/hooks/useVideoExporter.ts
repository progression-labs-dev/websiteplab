'use client';

import { useState, useRef, useCallback } from 'react';
import { ImageBuffer } from '../utils/imageProcessing';
import { createVideoEncoder, supportsWebCodecs } from '../utils/videoEncoder';

export interface ExportOptions {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  /** Optional per-frame mask updater. Returns a new mask or null (keep previous). */
  maskTracker?: (buffer: ImageBuffer, frameIndex: number) => Promise<Uint8Array | null>;
}

export interface ExportState {
  exporting: boolean;
  progress: number;        // 0–1
  currentFrame: number;
  totalFrames: number;
  estimatedTimeLeft: number; // seconds remaining, -1 when unknown
}

const INITIAL_STATE: ExportState = {
  exporting: false,
  progress: 0,
  currentFrame: 0,
  totalFrames: 0,
  estimatedTimeLeft: -1,
};

/**
 * Seeks a video element to the given time (in seconds) and resolves
 * once the `seeked` event fires. The timeout guard prevents hangs on
 * browsers that never fire `seeked` for out-of-range times.
 */
function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const SEEK_TIMEOUT_MS = 5000;

    const timer = setTimeout(() => {
      video.onseeked = null;
      reject(new Error(`Seek timed out at t=${time.toFixed(3)}s`));
    }, SEEK_TIMEOUT_MS);

    video.onseeked = () => {
      clearTimeout(timer);
      video.onseeked = null;
      resolve();
    };

    video.currentTime = time;
  });
}

/**
 * Reads the pixel data from a canvas into an ImageBuffer.
 */
function canvasToImageBuffer(canvas: HTMLCanvasElement): ImageBuffer {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context from offscreen canvas');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: imageData.data, width: canvas.width, height: canvas.height };
}

/**
 * Downloads a video blob using multiple strategies in sequence.
 * Each method targets a different browser quirk:
 *
 * 1. Data URL + anchor (no blob URL, no server, works in Safari 14.1+)
 * 2. API route + window.location.href (server-side Content-Disposition)
 * 3. Blob URL + anchor (last resort, may produce UUID filename)
 */
async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  // Strategy 1: Data URL with application/octet-stream
  // Converts blob to base64 data URL. Unlike blob: URLs, the download
  // attribute IS respected on data: URLs in Safari/WebKit/Arc.
  // Using octet-stream prevents the browser from trying to play the video.
  try {
    const octetBlob = new Blob([blob], { type: 'application/octet-stream' });
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(octetBlob);
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 10_000);
    return;
  } catch {
    // Fall through to strategy 2
  }

  // Strategy 2: Server-side Content-Disposition via API route
  try {
    const res = await fetch('/api/tools/mosaic/download', {
      method: 'POST',
      headers: { 'x-filename': filename },
      body: blob,
    });
    if (res.ok) {
      const { token } = await res.json();
      window.location.href = `/api/tools/mosaic/download?token=${token}`;
      return;
    }
  } catch {
    // Fall through to strategy 3
  }

  // Strategy 3: Direct blob URL (may produce UUID filename but at least downloads)
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 60_000);
}

// ---------------------------------------------------------------------------

export function useVideoExporter() {
  const [exportState, setExportState] = useState<ExportState>(INITIAL_STATE);

  // A ref rather than state so the export loop can read it synchronously
  // without stale closure issues.
  const cancelledRef = useRef(false);

  const cancelExport = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const startExport = useCallback(async (
    videoElement: HTMLVideoElement,
    renderFrame: (buffer: ImageBuffer, targetCanvas: HTMLCanvasElement) => void,
    options: ExportOptions,
  ): Promise<void> => {
    if (!supportsWebCodecs()) {
      throw new Error(
        'Video export requires WebCodecs (Chrome 94+ / Edge 94+). ' +
        'This browser does not support it.'
      );
    }

    const { width, height, fps, bitrate, maskTracker } = options;
    const duration = videoElement.duration;

    if (!isFinite(duration) || duration <= 0) {
      throw new Error('Video duration is unknown or zero — cannot export.');
    }

    const totalFrames = Math.floor(duration * fps);

    cancelledRef.current = false;

    setExportState({
      exporting: true,
      progress: 0,
      currentFrame: 0,
      totalFrames,
      estimatedTimeLeft: -1,
    });

    // Offscreen canvas: receives raw video frames
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const sourceCtx = sourceCanvas.getContext('2d')!;

    // Target canvas: receives mosaic-rendered output that gets encoded
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = width;
    targetCanvas.height = height;

    const encoder = await createVideoEncoder({ width, height, fps, bitrate });

    const startTime = performance.now();

    try {
      // Pause playback while we step through frames manually
      videoElement.pause();

      // Seek to the very beginning before starting
      await seekTo(videoElement, 0);

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        if (cancelledRef.current) {
          break;
        }

        const frameTimeSecs = frameIndex / fps;
        const timestampMicros = Math.round(frameTimeSecs * 1_000_000);

        // 1. Seek video to this frame's time
        await seekTo(videoElement, frameTimeSecs);

        // 2. Draw raw video frame onto the source canvas
        sourceCtx.drawImage(videoElement, 0, 0, width, height);

        // 3. Extract ImageBuffer from the source canvas
        const imageBuffer = canvasToImageBuffer(sourceCanvas);

        // 4. Optionally update the mask for this frame
        if (maskTracker) {
          await maskTracker(imageBuffer, frameIndex);
          // The maskTracker is responsible for updating the mask state
          // that the renderFrame callback will pick up via its closure.
          // We intentionally ignore the returned mask here — the caller
          // wires their own mask state so renderFrame stays decoupled.
        }

        // 5. Render mosaic effects onto the target canvas
        renderFrame(imageBuffer, targetCanvas);

        // 6. Encode the rendered frame
        await encoder.encodeFrame(targetCanvas, timestampMicros);

        // 7. Update progress state
        const elapsed = (performance.now() - startTime) / 1000; // seconds
        const framesCompleted = frameIndex + 1;
        const progress = framesCompleted / totalFrames;
        const avgSecsPerFrame = elapsed / framesCompleted;
        const estimatedTimeLeft = Math.round(avgSecsPerFrame * (totalFrames - framesCompleted));

        setExportState({
          exporting: true,
          progress,
          currentFrame: framesCompleted,
          totalFrames,
          estimatedTimeLeft,
        });
      }

      if (cancelledRef.current) {
        encoder.close();
        setExportState(INITIAL_STATE);
        return;
      }

      // 8. Flush + mux → Blob → download
      const blob = await encoder.finalize();
      encoder.close();
      await downloadBlob(blob, `mosaic-export-${Date.now()}.mp4`);

    } catch (err) {
      encoder.close();
      setExportState(INITIAL_STATE);
      throw err;
    }

    setExportState(INITIAL_STATE);
  }, []);

  return { exportState, startExport, cancelExport };
}
