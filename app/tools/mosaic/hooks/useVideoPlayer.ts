import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageBuffer } from '../utils/imageProcessing';

export interface VideoState {
  loaded: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
}

export function useVideoPlayer(
  onFrame: (buffer: ImageBuffer) => void
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const rafId = useRef<number>(0);

  const [state, setState] = useState<VideoState>({
    loaded: false,
    playing: false,
    currentTime: 0,
    duration: 0,
  });

  const extractFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = offscreenCanvas.current;
    if (!video || !canvas || video.paused || video.ended) return;

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
    rafId.current = requestAnimationFrame(extractFrame);
  }, [onFrame]);

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
      // Cap at 1080p
      let w = video.videoWidth;
      let h = video.videoHeight;
      const maxDim = 1920;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

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
      });

      // Extract first frame
      video.currentTime = 0;
    };

    video.onseeked = () => {
      // Extract frame after seek
      const canvas = offscreenCanvas.current;
      if (!canvas) return;
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
      video.play();
      setState(s => ({ ...s, playing: true }));
      rafId.current = requestAnimationFrame(extractFrame);
    } else {
      video.pause();
      cancelAnimationFrame(rafId.current);
      setState(s => ({ ...s, playing: false }));
    }
  }, [extractFrame]);

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

  return { state, loadVideo, togglePlay, seek };
}
