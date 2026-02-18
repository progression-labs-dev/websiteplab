'use client';

import { useState, useRef, useCallback, useEffect, DragEvent } from 'react';
import './mosaic.css';
import MosaicCanvas, { MosaicCanvasHandle } from './components/MosaicCanvas';
import ControlPanel from './components/ControlPanel';
import { MosaicParams, DEFAULT_PARAMS, useMosaicRenderer } from './hooks/useMosaicRenderer';
import { ImageBuffer, loadImageToBuffer } from './utils/imageProcessing';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useSubjectMask } from './hooks/useSubjectMask';
import { useVideoExporter, ExportOptions } from './hooks/useVideoExporter';

export default function MosaicToolPage() {
  const [params, setParams] = useState<MosaicParams>(DEFAULT_PARAMS);
  const [buffer, setBuffer] = useState<ImageBuffer | null>(null);
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const canvasRef = useRef<MosaicCanvasHandle>(null);

  // Export settings state
  const [exportResolution, setExportResolution] = useState<string>('original');
  const [exportQuality, setExportQuality] = useState<number>(80);

  // Subject mask hook
  const {
    mask,
    points,
    isLoading,
    isEncoding,
    isDecoding,
    initModel,
    encodeImage,
    addPoint,
    removeLastPoint,
    clearMask,
    invertMask,
  } = useSubjectMask();

  // Mosaic renderer (needed for the export render callback)
  const { render } = useMosaicRenderer();

  // Video exporter
  const { exportState, startExport, cancelExport } = useVideoExporter();

  // Track whether the SAM model has been initialized
  const modelInitedRef = useRef(false);

  // Video frame callback — updates the buffer each frame
  const handleVideoFrame = useCallback((frameBuffer: ImageBuffer) => {
    setBuffer(frameBuffer);
  }, []);

  const { state: videoState, loadVideo, togglePlay, seek, getVideoElement } = useVideoPlayer(handleVideoFrame);

  // Derived: mask is locked when video is playing in subject mode.
  // This prevents expensive re-encoding on every frame during live playback.
  const isMaskLocked = mediaType === 'video' && videoState.playing && params.maskMode === 'subject';

  // When maskMode switches to 'subject', init model + encode image.
  // Skip re-encoding while video is playing (mask is locked to last computed value).
  useEffect(() => {
    if (params.maskMode !== 'subject') return;

    const setup = async () => {
      if (!modelInitedRef.current) {
        await initModel();
        modelInitedRef.current = true;
      }
      if (buffer && !isMaskLocked) {
        await encodeImage(buffer);
      }
    };
    setup().catch(err => {
      console.error('Subject mask setup failed:', err);
    });
  }, [params.maskMode, buffer, initModel, encodeImage, isMaskLocked]);

  const handleParamChange = useCallback((partial: Partial<MosaicParams>) => {
    setParams(prev => ({ ...prev, ...partial }));
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      clearMask();
      const imgBuffer = await loadImageToBuffer(file);
      setBuffer(imgBuffer);
      setMediaType('image');
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to load image. Please try a different file.');
    }
  }, [clearMask]);

  const handleVideoUpload = useCallback((file: File) => {
    loadVideo(file);
    setMediaType('video');
  }, [loadVideo]);

  // PNG export for static images
  const handleExportPNG = useCallback(() => {
    canvasRef.current?.exportPNG();
  }, []);

  // Video export: seeks through every frame, renders mosaic, encodes to MP4
  const handleExportVideo = useCallback(async () => {
    const videoElement = getVideoElement();
    if (!videoElement || !buffer) return;

    // Determine output dimensions based on resolution preset
    let outWidth = buffer.width;
    let outHeight = buffer.height;

    if (exportResolution !== 'original') {
      const targetShortSide = exportResolution === '1080p' ? 1080 : 720;
      const longestSide = Math.max(buffer.width, buffer.height);
      if (longestSide > targetShortSide) {
        const scale = targetShortSide / longestSide;
        outWidth = Math.round(buffer.width * scale);
        outHeight = Math.round(buffer.height * scale);
      }
    }

    // Map quality slider (0–100) to bitrate (500 kbps – 8 Mbps)
    const bitrate = Math.round(500_000 + (exportQuality / 100) * 7_500_000);

    // Snapshot params and mask at export-start time so mid-export UI changes don't corrupt frames
    const exportParams = { ...params };
    const exportMask = mask ? new Uint8Array(mask) : null;

    const options: ExportOptions = {
      width: outWidth,
      height: outHeight,
      fps: 30,
      bitrate,
    };

    // renderFrame receives the raw frame buffer and draws the mosaic onto targetCanvas
    const renderFrame = (frameBuffer: ImageBuffer, targetCanvas: HTMLCanvasElement) => {
      render(targetCanvas, frameBuffer, exportParams, exportMask ?? undefined);
    };

    try {
      await startExport(videoElement, renderFrame, options);
    } catch (err) {
      console.error('Video export failed:', err);
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [getVideoElement, buffer, exportResolution, exportQuality, params, mask, render, startExport]);

  // Smart export: PNG for images, video for videos
  const handleExport = useCallback(() => {
    if (mediaType === 'video') {
      handleExportVideo();
    } else {
      handleExportPNG();
    }
  }, [mediaType, handleExportVideo, handleExportPNG]);

  // Canvas click handler for subject mask mode
  const handleCanvasClick = useCallback((x: number, y: number, label: 0 | 1) => {
    // Ignore clicks while mask is locked (video is playing)
    if (isMaskLocked) return;
    addPoint(x, y, label);
  }, [addPoint, isMaskLocked]);

  // Drag-and-drop support on the canvas area
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else if (file.type.startsWith('video/')) {
      handleVideoUpload(file);
    }
  }, [handleImageUpload, handleVideoUpload]);

  // Build subject mask state for ControlPanel
  const subjectMaskState = {
    isModelLoading: isLoading,
    isEncoding,
    isDecoding,
    pointCount: points.length,
    hasMask: !!mask,
  };

  return (
    <div className="mosaic-tool">
      <main
        className={`mosaic-canvas-area ${dragging ? 'mosaic-drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <MosaicCanvas
          ref={canvasRef}
          buffer={buffer}
          params={params}
          splitPosition={params.splitPosition}
          splitAngle={params.splitAngle}
          subjectMask={mask}
          onCanvasClick={handleCanvasClick}
          clickPoints={points}
        />
      </main>

      <ControlPanel
        params={params}
        onChange={handleParamChange}
        onImageUpload={handleImageUpload}
        onVideoUpload={handleVideoUpload}
        onExport={handleExport}
        hasMedia={mediaType !== 'none'}
        mediaType={mediaType}
        videoState={mediaType === 'video' ? videoState : undefined}
        onTogglePlay={togglePlay}
        onSeek={seek}
        subjectMaskState={subjectMaskState}
        onUndoClick={removeLastPoint}
        onClearMask={clearMask}
        onInvertMask={invertMask}
        exportState={exportState}
        onExportVideo={handleExportVideo}
        onCancelExport={cancelExport}
        maskLocked={isMaskLocked}
        exportResolution={exportResolution}
        onExportResolutionChange={setExportResolution}
        exportQuality={exportQuality}
        onExportQualityChange={setExportQuality}
      />
    </div>
  );
}
