import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageBuffer } from '../utils/imageProcessing';

export interface VideoState {
  loaded: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  fps: number;
}

export function useVideoPlayer(
  onFrame: (buffer: ImageBuffer) => void,
  previewScale = 0.5
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  // Store full-resolution dimensions so we can restore on pause/seek
  const fullRes = useRef<{ w: number; h: number } | null>(null);
  const rafId = useRef<number>(0);

  // Frame-skipping state: track ticks and last-emit time for FPS calculation
  const rafTickCount = useRef<number>(0);
  const fpsWindowStart = useRef<number>(0);
  const fpsFrameCount = useRef<number>(0);

  const [state, setState] = useState<VideoState>({
    loaded: false,
    playing: false,
    currentTime: 0,
    duration: 0,
    fps: 0,
  });

  // Target ~15fps during playback. Most monitors run at 60fps, so emit every 4th tick.
  const PLAYBACK_TARGET_FPS = 15;
  const RAF_NATIVE_FPS = 60;
  const SKIP_INTERVAL = Math.round(RAF_NATIVE_FPS / PLAYBACK_TARGET_FPS); // 4

  /** Resize the offscreen canvas to the given dimensions, keeping the element */
  const resizeCanvas = useCallback((w: number, h: number) => {
    const canvas = offscreenCanvas.current;
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;
  }, []);

  const extractFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = offscreenCanvas.current;
    if (!video || !canvas || video.paused || video.ended) return;

    rafTickCount.current += 1;

    // Frame skipping: only emit every SKIP_INTERVAL ticks
    if (rafTickCount.current % SKIP_INTERVAL !== 0) {
      rafId.current = requestAnimationFrame(extractFrame);
      return;
    }

    // Ensure canvas is at preview resolution during playback
    const full = fullRes.current;
    if (full) {
      const pw = Math.round(full.w * previewScale);
      const ph = Math.round(full.h * previewScale);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    onFrame({
      data: imageData.data,
      width: canvas.width,
      height: canvas.height,
    });

    // FPS tracking: measure actual emit rate over a 1-second window
    fpsFrameCount.current += 1;
    const now = performance.now();
    const elapsed = now - fpsWindowStart.current;
    if (elapsed >= 1000) {
      const measuredFps = Math.round((fpsFrameCount.current * 1000) / elapsed);
      fpsWindowStart.current = now;
      fpsFrameCount.current = 0;
      setState(s => ({ ...s, currentTime: video.currentTime, fps: measuredFps }));
    } else {
      setState(s => ({ ...s, currentTime: video.currentTime }));
    }

    rafId.current = requestAnimationFrame(extractFrame);
  }, [onFrame, previewScale, SKIP_INTERVAL, resizeCanvas]);

  const loadVideo = useCallback((file: File) => {
    const url = URL.createObjectURL(file);

    if (videoRef.current) {
      URL.revokeObjectURL(videoRef.current.src);
    }

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    video.onloadedmetadata = () => {
      // Cap at 1920px on the longest side
      let w = video.videoWidth;
      let h = video.videoHeight;
      const maxDim = 1920;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      // Store full resolution for later restore
      fullRes.current = { w, h };

      // Create canvas at full resolution initially (for the first-frame seek)
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      offscreenCanvas.current = canvas;

      videoRef.current = video;
      setState({
        loaded: true,
        playing: false,
        currentTime: 0,
        duration: video.duration,
        fps: 0,
      });

      // Extract first frame at full resolution
      video.currentTime = 0;
    };

    video.onseeked = () => {
      // On seek/pause, restore full-resolution canvas for best quality
      const canvas = offscreenCanvas.current;
      const full = fullRes.current;
      if (!canvas || !full) return;

      // Restore full resolution
      if (canvas.width !== full.w || canvas.height !== full.h) {
        canvas.width = full.w;
        canvas.height = full.h;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      onFrame({
        data: imageData.data,
        width: canvas.width,
        height: canvas.height,
      });
      setState(s => ({ ...s, currentTime: video.currentTime }));
    };

    video.src = url;
    video.load();
  }, [onFrame]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      // Reset frame-skip counters on play start
      rafTickCount.current = 0;
      fpsWindowStart.current = performance.now();
      fpsFrameCount.current = 0;

      video.play();
      setState(s => ({ ...s, playing: true }));
      rafId.current = requestAnimationFrame(extractFrame);
    } else {
      video.pause();
      cancelAnimationFrame(rafId.current);

      // Restore full-resolution canvas on pause so the paused frame is crisp
      const canvas = offscreenCanvas.current;
      const full = fullRes.current;
      if (canvas && full && (canvas.width !== full.w || canvas.height !== full.h)) {
        canvas.width = full.w;
        canvas.height = full.h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          onFrame({
            data: imageData.data,
            width: canvas.width,
            height: canvas.height,
          });
        }
      }

      setState(s => ({ ...s, playing: false, fps: 0 }));
    }
  }, [extractFrame, onFrame]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafId.current);
      if (videoRef.current) {
        videoRef.current.pause();
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, []);

  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    return videoRef.current;
  }, []);

  return { state, loadVideo, togglePlay, seek, getVideoElement };
}
