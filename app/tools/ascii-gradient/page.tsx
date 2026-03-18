'use client';

import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from 'react';
import './ascii-gradient.css';
import AsciiGradientCanvas, { AsciiGradientCanvasHandle } from './components/AsciiGradientCanvas';
import { AsciiGradientParams, DEFAULT_ASCII_GRADIENT_PARAMS } from './hooks/useAsciiGradientRenderer';
import { GradientMode } from './utils/gradientModes';
import { BRAND_PALETTES, GradientStop } from '../mosaic/hooks/useMosaicRenderer';
import { ImageBuffer, loadImageToBuffer } from '../mosaic/utils/imageProcessing';
import { hexToRgb, rgbToHex } from '../mosaic/utils/colorMapping';
import { useSubjectMask } from '../mosaic/hooks/useSubjectMask';

export default function AsciiGradientPage() {
  const [params, setParams] = useState<AsciiGradientParams>(DEFAULT_ASCII_GRADIENT_PARAMS);
  const [buffer, setBuffer] = useState<ImageBuffer | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<AsciiGradientCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom color palette state
  const [customColorStart, setCustomColorStart] = useState('#0000ff');
  const [customColorEnd, setCustomColorEnd] = useState('#f5f5f5');
  const [isCustomPalette, setIsCustomPalette] = useState(false);

  // Track active brand palette ID (null when custom)
  const [activePaletteId, setActivePaletteId] = useState<string>('blue');

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
  } = useSubjectMask();

  // Track whether the SAM model has been initialized
  const modelInitedRef = useRef(false);

  // Auto-init SAM model and encode image when buffer is set
  useEffect(() => {
    if (!buffer) return;

    const setup = async () => {
      if (!modelInitedRef.current) {
        await initModel();
        modelInitedRef.current = true;
      }
      await encodeImage(buffer);
    };
    setup().catch(err => {
      console.error('Subject mask setup failed:', err);
    });
  }, [buffer, initModel, encodeImage]);

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      clearMask();
      const imgBuffer = await loadImageToBuffer(file);
      setBuffer(imgBuffer);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to load image. Please try a different file.');
    }
  }, [clearMask]);

  // File input change handler
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  }, [handleImageUpload]);

  // Drag-and-drop support
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
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  // Canvas click handler for subject mask
  const handleCanvasClick = useCallback((x: number, y: number, label: 0 | 1) => {
    addPoint(x, y, label);
  }, [addPoint]);

  // Palette selection
  const handlePaletteSelect = useCallback((paletteId: string, stops: GradientStop[]) => {
    setActivePaletteId(paletteId);
    setIsCustomPalette(false);
    setParams(prev => ({ ...prev, gradientStops: stops }));
  }, []);

  // Custom palette selection
  const handleCustomPaletteSelect = useCallback(() => {
    setActivePaletteId('');
    setIsCustomPalette(true);
    const startRgb = hexToRgb(customColorStart);
    const endRgb = hexToRgb(customColorEnd);
    setParams(prev => ({
      ...prev,
      gradientStops: [
        { color: startRgb, label: 'Start' },
        { color: endRgb, label: 'End' },
      ],
    }));
  }, [customColorStart, customColorEnd]);

  // Custom color change handlers
  const handleCustomStartChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColorStart(hex);
    if (isCustomPalette) {
      const rgb = hexToRgb(hex);
      setParams(prev => ({
        ...prev,
        gradientStops: [
          { color: rgb, label: 'Start' },
          prev.gradientStops[1] || { color: hexToRgb(customColorEnd), label: 'End' },
        ],
      }));
    }
  }, [isCustomPalette, customColorEnd]);

  const handleCustomEndChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColorEnd(hex);
    if (isCustomPalette) {
      const rgb = hexToRgb(hex);
      setParams(prev => ({
        ...prev,
        gradientStops: [
          prev.gradientStops[0] || { color: hexToRgb(customColorStart), label: 'Start' },
          { color: rgb, label: 'End' },
        ],
      }));
    }
  }, [isCustomPalette, customColorStart]);

  // Export handler
  const handleExport = useCallback(() => {
    if (!buffer || !mask) return;
    setIsExporting(true);
    // Allow a frame for the UI to update before the potentially heavy export
    requestAnimationFrame(() => {
      canvasRef.current?.exportPNG();
      setIsExporting(false);
    });
  }, [buffer, mask]);

  // Build gradient preview CSS from stops
  const stopsToGradient = useCallback((stops: GradientStop[]): string => {
    const colors = stops.map((s, i) => {
      const pct = stops.length === 1 ? 0 : (i / (stops.length - 1)) * 100;
      return `rgb(${s.color[0]},${s.color[1]},${s.color[2]}) ${pct}%`;
    });
    return `linear-gradient(90deg, ${colors.join(', ')})`;
  }, []);

  // Status bar text
  const statusText = (() => {
    if (isLoading) return 'Loading AI model...';
    if (isEncoding) return 'Analyzing image...';
    if (isDecoding) return 'Processing...';
    if (buffer && !mask) return 'Click on the subject to select it';
    return null;
  })();

  return (
    <div className="ag-tool">
      {/* Canvas area */}
      <main
        className={`ag-canvas-area ${dragging ? 'ag-drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {buffer ? (
          <div className="ag-canvas-container">
            <AsciiGradientCanvas
              ref={canvasRef}
              buffer={buffer}
              params={params}
              subjectMask={mask}
              onCanvasClick={handleCanvasClick}
              clickPoints={points}
            />
          </div>
        ) : (
          <div
            className="ag-upload-prompt"
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Drop an image here or click to upload</p>
            <span>PNG, JPG, WebP supported</span>
          </div>
        )}

        {statusText && (
          <div className={`ag-status-bar ${isLoading || isEncoding || isDecoding ? 'ag-status-loading' : ''}`}>
            {statusText}
          </div>
        )}
      </main>

      {/* Controls sidebar */}
      <aside className="ag-sidebar">
        {/* Upload */}
        <div className="ag-section">
          <div className="ag-section-title">Image</div>
          <button
            className="ag-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Cell Size */}
        <div className="ag-section">
          <div className="ag-section-title">Cell Size</div>
          <div className="ag-slider-group">
            <div className="ag-slider-label">
              <span>Size</span>
              <span>{params.cellSize}px</span>
            </div>
            <input
              type="range"
              className="ag-slider"
              min={8}
              max={60}
              value={params.cellSize}
              onChange={(e) => setParams(prev => ({ ...prev, cellSize: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* ASCII Density */}
        <div className="ag-section">
          <div className="ag-section-title">ASCII Density</div>
          <div className="ag-slider-group">
            <div className="ag-slider-label">
              <span>Density</span>
              <span>{Math.round(params.asciiDensity * 100)}%</span>
            </div>
            <input
              type="range"
              className="ag-slider"
              min={20}
              max={90}
              value={Math.round(params.asciiDensity * 100)}
              onChange={(e) => setParams(prev => ({ ...prev, asciiDensity: Number(e.target.value) / 100 }))}
            />
          </div>
        </div>

        {/* Brightness Cutoff */}
        <div className="ag-section">
          <div className="ag-section-title">Brightness Cutoff</div>
          <div className="ag-slider-group">
            <div className="ag-slider-label">
              <span>Lighter areas only</span>
              <span>{params.brightnessCutoff}</span>
            </div>
            <input
              type="range"
              className="ag-slider"
              min={0}
              max={200}
              value={params.brightnessCutoff}
              onChange={(e) => setParams(prev => ({ ...prev, brightnessCutoff: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Film Grain */}
        <div className="ag-section">
          <div className="ag-section-title">Film Grain</div>
          <div className="ag-slider-group">
            <div className="ag-slider-label">
              <span>Intensity</span>
              <span>{Math.round(params.grainOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              className="ag-slider"
              min={0}
              max={20}
              value={Math.round(params.grainOpacity * 100)}
              onChange={(e) => setParams(prev => ({ ...prev, grainOpacity: Number(e.target.value) / 100 }))}
            />
          </div>
        </div>

        {/* Gradient Mode */}
        <div className="ag-section">
          <div className="ag-section-title">Gradient Mode</div>
          <select
            className="ag-select"
            value={params.gradientMode}
            onChange={(e) => setParams(prev => ({ ...prev, gradientMode: e.target.value as GradientMode }))}
          >
            <option value="brightness">Brightness-mapped</option>
            <option value="top-to-bottom">Top to Bottom</option>
            <option value="radial">Radial from Center</option>
            <option value="diagonal">Diagonal</option>
          </select>
        </div>

        {/* Color Palette */}
        <div className="ag-section">
          <div className="ag-section-title">Color Palette</div>
          <div className="ag-palette-grid">
            {BRAND_PALETTES.map((palette) => (
              <button
                key={palette.id}
                className={`ag-palette-swatch ${!isCustomPalette && activePaletteId === palette.id ? 'active' : ''}`}
                onClick={() => handlePaletteSelect(palette.id, palette.stops)}
              >
                <div
                  className="ag-palette-preview"
                  style={{ background: stopsToGradient(palette.stops) }}
                />
                <span className="ag-palette-label">{palette.label}</span>
              </button>
            ))}
            {/* Custom swatch */}
            <button
              className={`ag-palette-swatch ${isCustomPalette ? 'active' : ''}`}
              onClick={handleCustomPaletteSelect}
            >
              <div
                className="ag-palette-preview"
                style={{ background: `linear-gradient(90deg, ${customColorStart}, ${customColorEnd})` }}
              />
              <span className="ag-palette-label">Custom</span>
            </button>
          </div>

          {/* Custom color pickers — shown when custom palette is active */}
          {isCustomPalette && (
            <div className="ag-custom-colors">
              <div className="ag-color-row">
                <span>Start</span>
                <input
                  type="color"
                  className="ag-color-picker"
                  value={customColorStart}
                  onChange={handleCustomStartChange}
                />
                <span className="ag-color-hex">{customColorStart}</span>
              </div>
              <div className="ag-color-row">
                <span>End</span>
                <input
                  type="color"
                  className="ag-color-picker"
                  value={customColorEnd}
                  onChange={handleCustomEndChange}
                />
                <span className="ag-color-hex">{customColorEnd}</span>
              </div>
            </div>
          )}
        </div>

        {/* Subject Mask */}
        {mask && (
          <div className="ag-section">
            <div className="ag-section-title">Subject Mask</div>
            <div className="ag-mask-actions">
              <button
                className="ag-mask-btn"
                onClick={removeLastPoint}
                disabled={points.length === 0}
              >
                Undo Click
              </button>
              <button
                className="ag-mask-btn"
                onClick={clearMask}
              >
                Clear Mask
              </button>
            </div>
          </div>
        )}

        {/* Export */}
        <div className="ag-section">
          <div className="ag-section-title">Export</div>
          <button
            className="ag-export-btn"
            disabled={!buffer || !mask || isExporting}
            onClick={handleExport}
          >
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </button>
        </div>
      </aside>
    </div>
  );
}
