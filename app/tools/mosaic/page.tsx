'use client';

import { useState, useRef, useCallback, useEffect, DragEvent } from 'react';
import './mosaic.css';
import MosaicCanvas, { MosaicCanvasHandle } from './components/MosaicCanvas';
import ControlPanel from './components/ControlPanel';
import { MosaicParams, DEFAULT_PARAMS } from './hooks/useMosaicRenderer';
import { ImageBuffer, loadImageToBuffer } from './utils/imageProcessing';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useSubjectMask } from './hooks/useSubjectMask';

export default function MosaicToolPage() {
  const [params, setParams] = useState<MosaicParams>(DEFAULT_PARAMS);
  const [buffer, setBuffer] = useState<ImageBuffer | null>(null);
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const canvasRef = useRef<MosaicCanvasHandle>(null);

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

  // Track whether the model has been initialized
  const modelInitedRef = useRef(false);

  // When maskMode switches to 'subject', init model + encode image
  useEffect(() => {
    if (params.maskMode !== 'subject') return;

    const setup = async () => {
      if (!modelInitedRef.current) {
        await initModel();
        modelInitedRef.current = true;
      }
      if (buffer) {
        await encodeImage(buffer);
      }
    };
    setup().catch(err => {
      console.error('Subject mask setup failed:', err);
    });
  }, [params.maskMode, buffer, initModel, encodeImage]);

  // Video frame callback — updates the buffer each frame
  const handleVideoFrame = useCallback((frameBuffer: ImageBuffer) => {
    setBuffer(frameBuffer);
  }, []);

  const { state: videoState, loadVideo, togglePlay, seek } = useVideoPlayer(handleVideoFrame);

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

  const handleExport = useCallback(() => {
    canvasRef.current?.exportPNG();
  }, []);

  // Canvas click handler for subject mask mode
  const handleCanvasClick = useCallback((x: number, y: number, label: 0 | 1) => {
    addPoint(x, y, label);
  }, [addPoint]);

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
        videoState={mediaType === 'video' ? videoState : undefined}
        onTogglePlay={togglePlay}
        onSeek={seek}
        subjectMaskState={subjectMaskState}
        onUndoClick={removeLastPoint}
        onClearMask={clearMask}
        onInvertMask={invertMask}
      />
    </div>
  );
}
