'use client';

import { useCallback } from 'react';
import { MosaicParams, ShapeMode, ColorMode, BgMode, MaskMode, GradientStop } from '../hooks/useMosaicRenderer';
import { ExportState } from '../hooks/useVideoExporter';
import { rgbToHex, hexToRgb } from '../utils/colorMapping';

interface SubjectMaskState {
  isModelLoading: boolean;
  isEncoding: boolean;
  isDecoding: boolean;
  pointCount: number;
  hasMask: boolean;
}

interface ControlPanelProps {
  params: MosaicParams;
  onChange: (params: Partial<MosaicParams>) => void;
  onImageUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
  onExport: () => void;
  hasMedia: boolean;
  mediaType?: 'none' | 'image' | 'video';
  videoState?: {
    loaded: boolean;
    playing: boolean;
    currentTime: number;
    duration: number;
  };
  onTogglePlay?: () => void;
  onSeek?: (time: number) => void;
  // Subject mask props
  subjectMaskState?: SubjectMaskState;
  onUndoClick?: () => void;
  onClearMask?: () => void;
  onInvertMask?: () => void;
  // Export props
  exportState?: ExportState;
  onExportVideo?: () => void;
  onCancelExport?: () => void;
  maskLocked?: boolean;
  exportResolution?: string;
  onExportResolutionChange?: (resolution: string) => void;
  exportQuality?: number;
  onExportQualityChange?: (quality: number) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mosaic-slider-group">
      <div className="mosaic-slider-label">
        <span>{label}</span>
        <span>{value}{suffix}</span>
      </div>
      <input
        type="range"
        className="mosaic-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mosaic-toggle-row">
      <span>{label}</span>
      <label className="mosaic-toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="mosaic-toggle-track" />
        <div className="mosaic-toggle-thumb" />
      </label>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatETA(seconds: number): string {
  if (seconds < 0) return '…';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function ControlPanel({
  params,
  onChange,
  onImageUpload,
  onVideoUpload,
  onExport,
  hasMedia,
  mediaType = 'none',
  videoState,
  onTogglePlay,
  onSeek,
  subjectMaskState,
  onUndoClick,
  onClearMask,
  onInvertMask,
  exportState,
  onExportVideo,
  onCancelExport,
  maskLocked = false,
  exportResolution = 'original',
  onExportResolutionChange,
  exportQuality = 80,
  onExportQualityChange,
}: ControlPanelProps) {
  const isExporting = exportState?.exporting ?? false;

  // Imperative file picker — creates a throwaway <input> per click
  // so React StrictMode / hydration can never double-trigger it
  const pickFile = useCallback((accept: string, onFile: (f: File) => void) => {
    if (isExporting) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onFile(file);
    };
    input.click();
  }, [isExporting]);

  return (
    <aside className="mosaic-sidebar">
      {/* Upload */}
      <div className="mosaic-section">
        <div className="mosaic-section-title">Media</div>
        <div className="mosaic-upload-row">
          <button
            className="mosaic-upload-btn"
            onClick={() => pickFile('image/jpeg,image/png,image/webp,image/gif', onImageUpload)}
            disabled={isExporting}
          >
            Upload Image
          </button>
          <button
            className="mosaic-upload-btn"
            onClick={() => pickFile('video/mp4,video/webm', onVideoUpload)}
            disabled={isExporting}
          >
            Upload Video
          </button>
        </div>

        {/* Video controls */}
        {videoState?.loaded && (
          <div style={{ marginTop: 12 }}>
            <div className="mosaic-video-controls">
              <button
                className="mosaic-play-btn"
                onClick={onTogglePlay}
                disabled={isExporting}
              >
                {videoState.playing ? '⏸' : '▶'}
              </button>
              <input
                type="range"
                className="mosaic-slider"
                min={0}
                max={videoState.duration}
                step={0.1}
                value={videoState.currentTime}
                onChange={e => onSeek?.(Number(e.target.value))}
                style={{ flex: 1 }}
                disabled={isExporting}
              />
              <span className="mosaic-video-time">
                {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shape Mode */}
      <div className="mosaic-section">
        <div className="mosaic-section-title">Shape Mode</div>
        <div className="mosaic-shape-toggle">
          <button
            className={`mosaic-shape-btn ${params.shapeMode === 'pixel' ? 'active' : ''}`}
            onClick={() => onChange({ shapeMode: 'pixel' as ShapeMode })}
            disabled={isExporting}
          >
            Pixel
          </button>
          <button
            className={`mosaic-shape-btn ${params.shapeMode === 'circle' ? 'active' : ''}`}
            onClick={() => onChange({ shapeMode: 'circle' as ShapeMode })}
            disabled={isExporting}
          >
            Circle
          </button>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="mosaic-section">
        <div className="mosaic-section-title">Mosaic Grid</div>
        <Slider
          label="Cell Size"
          value={params.cellSize}
          min={2}
          max={40}
          onChange={v => onChange({ cellSize: v })}
          suffix="px"
          disabled={isExporting}
        />
        <Slider
          label="Spacing"
          value={params.spacing}
          min={0}
          max={20}
          onChange={v => onChange({ spacing: v })}
          suffix="px"
          disabled={isExporting}
        />
        <div style={{ marginTop: 12 }}>
          <div className="mosaic-slider-label" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#c4c7d0' }}>Background</span>
          </div>
          <div className="mosaic-bg-selector">
            {(['black', 'white', 'transparent'] as BgMode[]).map(bg => (
              <button
                key={bg}
                className={`mosaic-bg-option bg-${bg} ${params.bgMode === bg ? 'active' : ''}`}
                onClick={() => onChange({ bgMode: bg })}
                title={bg}
                disabled={isExporting}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mask Mode */}
      <div className="mosaic-section">
        <div className="mosaic-section-title">Mask Mode</div>
        <div className="mosaic-shape-toggle">
          {(['none', 'split', 'subject', 'auto'] as MaskMode[]).map(mode => (
            <button
              key={mode}
              className={`mosaic-shape-btn ${params.maskMode === mode ? 'active' : ''}`}
              onClick={() => onChange({
                maskMode: mode,
                splitEnabled: mode === 'split',
              })}
              disabled={isExporting}
            >
              {mode === 'none' ? 'None' : mode === 'split' ? 'Split' : mode === 'subject' ? 'Subject' : 'Auto'}
            </button>
          ))}
        </div>

        {/* Split controls (shown when maskMode='split') */}
        {params.maskMode === 'split' && (
          <>
            <Slider
              label="Position"
              value={Math.round(params.splitPosition * 100)}
              min={0}
              max={100}
              onChange={v => onChange({ splitPosition: v / 100 })}
              suffix="%"
              disabled={isExporting}
            />
            <div style={{ marginTop: 4 }}>
              <div className="mosaic-slider-label" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#c4c7d0' }}>Angle</span>
              </div>
              <div className="mosaic-angle-presets">
                {[
                  { label: '\u2014', value: 0, title: 'Horizontal' },
                  { label: '\u2572', value: 45, title: 'Diagonal' },
                  { label: '|', value: 90, title: 'Vertical' },
                  { label: '\u2571', value: 135, title: 'Reverse Diagonal' },
                ].map(preset => (
                  <button
                    key={preset.value}
                    className={`mosaic-angle-btn ${params.splitAngle === preset.value ? 'active' : ''}`}
                    onClick={() => onChange({ splitAngle: preset.value })}
                    title={preset.title}
                    disabled={isExporting}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <Slider
                label="Free Angle"
                value={params.splitAngle}
                min={0}
                max={180}
                onChange={v => onChange({ splitAngle: v })}
                suffix="°"
                disabled={isExporting}
              />
            </div>
          </>
        )}

        {/* Subject mask controls (shown when maskMode='subject') */}
        {params.maskMode === 'subject' && (
          <div style={{ marginTop: 8 }}>
            {/* Mask locked indicator during video playback */}
            {maskLocked ? (
              <div className="mask-locked-indicator">
                Mask locked during playback
              </div>
            ) : (
              <>
                {/* Loading states */}
                {subjectMaskState?.isModelLoading && (
                  <div className="mosaic-mask-status">Loading AI model...</div>
                )}
                {subjectMaskState?.isEncoding && (
                  <div className="mosaic-mask-status">Encoding image...</div>
                )}
                {subjectMaskState?.isDecoding && (
                  <div className="mosaic-mask-status">Generating mask...</div>
                )}

                {/* Instructions */}
                {!subjectMaskState?.isModelLoading && !subjectMaskState?.isEncoding && (
                  <div className="mosaic-mask-instructions">
                    Left-click to select, right-click to exclude
                  </div>
                )}
              </>
            )}

            {/* Action buttons */}
            <div className="mosaic-mask-actions">
              <button
                className="mosaic-mask-btn"
                onClick={onUndoClick}
                disabled={!subjectMaskState?.pointCount || maskLocked || isExporting}
              >
                Undo Click
              </button>
              <button
                className="mosaic-mask-btn"
                onClick={onClearMask}
                disabled={!subjectMaskState?.hasMask || maskLocked || isExporting}
              >
                Clear Mask
              </button>
              <button
                className="mosaic-mask-btn"
                onClick={onInvertMask}
                disabled={!subjectMaskState?.hasMask || maskLocked || isExporting}
              >
                Invert Mask
              </button>
            </div>

            {subjectMaskState?.pointCount && !maskLocked ? (
              <div className="mosaic-mask-info">
                {subjectMaskState.pointCount} click{subjectMaskState.pointCount !== 1 ? 's' : ''} placed
              </div>
            ) : null}
          </div>
        )}

        {/* Auto brightness mask controls (shown when maskMode='auto') */}
        {params.maskMode === 'auto' && (
          <div style={{ marginTop: 8 }}>
            <div className="mosaic-mask-instructions">
              Mosaic effect applies to bright/light areas automatically. Dark areas show original.
            </div>
            <Slider
              label="Brightness Cutoff"
              value={params.autoBrightnessCutoff}
              min={0}
              max={255}
              onChange={v => onChange({ autoBrightnessCutoff: v })}
              disabled={isExporting}
            />
            <Toggle
              label="Invert (dark areas)"
              checked={params.invertAutoMask}
              onChange={v => onChange({ invertAutoMask: v })}
              disabled={isExporting}
            />
          </div>
        )}
      </div>

      {/* Brightness Threshold */}
      <div className="mosaic-section">
        <div className="mosaic-section-title">Brightness Threshold</div>
        <Slider
          label="Threshold"
          value={params.threshold}
          min={0}
          max={255}
          onChange={v => onChange({ threshold: v })}
          disabled={isExporting}
        />
        <Toggle
          label="Invert"
          checked={params.invertThreshold}
          onChange={v => onChange({ invertThreshold: v })}
          disabled={isExporting}
        />
      </div>

      {/* Color Mapping */}
      <div className="mosaic-section">
        <div className="mosaic-section-title">Color Mapping</div>
        <div className="mosaic-shape-toggle" style={{ marginBottom: 14 }}>
          <button
            className={`mosaic-shape-btn ${params.colorMode === 'original' ? 'active' : ''}`}
            onClick={() => onChange({ colorMode: 'original' as ColorMode })}
            disabled={isExporting}
          >
            Original
          </button>
          <button
            className={`mosaic-shape-btn ${params.colorMode === 'gradient' ? 'active' : ''}`}
            onClick={() => onChange({ colorMode: 'gradient' as ColorMode })}
            disabled={isExporting}
          >
            Gradient
          </button>
        </div>
        {params.colorMode === 'gradient' && (
          <>
            {params.gradientStops.map((stop, i) => (
              <div className="mosaic-color-row" key={i}>
                <span>{stop.label}</span>
                <input
                  type="color"
                  className="mosaic-color-picker"
                  value={rgbToHex(...stop.color)}
                  onChange={e => {
                    const newStops = [...params.gradientStops];
                    newStops[i] = { ...newStops[i], color: hexToRgb(e.target.value) };
                    onChange({ gradientStops: newStops });
                  }}
                  disabled={isExporting}
                />
                <span className="mosaic-color-hex">{rgbToHex(...stop.color)}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ASCII Overlay */}
      <div className="mosaic-section">
        <div className="mosaic-section-title">ASCII Overlay</div>
        <Toggle
          label="Enable ASCII"
          checked={params.asciiEnabled}
          onChange={v => onChange({ asciiEnabled: v })}
          disabled={isExporting}
        />
        {params.asciiEnabled && (
          <Slider
            label="Opacity"
            value={Math.round(params.asciiOpacity * 100)}
            min={10}
            max={100}
            onChange={v => onChange({ asciiOpacity: v / 100 })}
            suffix="%"
            disabled={isExporting}
          />
        )}
      </div>

      {/* Export Settings (video only) */}
      {mediaType === 'video' && (
        <div className="mosaic-section export-settings">
          <div className="mosaic-section-title">Export Settings</div>
          <div className="mosaic-slider-label" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#c4c7d0' }}>Resolution</span>
          </div>
          <div className="mosaic-shape-toggle" style={{ marginBottom: 14 }}>
            {[
              { key: 'original', label: 'Original' },
              { key: '1080p', label: '1080p' },
              { key: '720p', label: '720p' },
            ].map(preset => (
              <button
                key={preset.key}
                className={`mosaic-shape-btn ${exportResolution === preset.key ? 'active' : ''}`}
                onClick={() => onExportResolutionChange?.(preset.key)}
                disabled={isExporting}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <Slider
            label="Quality"
            value={exportQuality}
            min={10}
            max={100}
            step={5}
            onChange={v => onExportQualityChange?.(v)}
            suffix="%"
            disabled={isExporting}
          />
        </div>
      )}

      {/* Export */}
      <div className="mosaic-section">
        {isExporting && exportState ? (
          <div className="export-progress-container">
            <div className="export-progress-header">
              <span className="export-progress-label">
                Exporting frame {exportState.currentFrame} / {exportState.totalFrames}
              </span>
              <span className="export-progress-eta">
                ETA {formatETA(exportState.estimatedTimeLeft)}
              </span>
            </div>
            <div className="export-progress-bar">
              <div
                className="export-progress-fill"
                style={{ width: `${Math.round(exportState.progress * 100)}%` }}
              />
            </div>
            <div className="export-progress-pct">
              {Math.round(exportState.progress * 100)}%
            </div>
            <button
              className="mosaic-export-btn export-cancel-btn"
              onClick={onCancelExport}
            >
              Cancel Export
            </button>
          </div>
        ) : (
          <button
            className="mosaic-export-btn"
            onClick={onExport}
            disabled={!hasMedia}
          >
            {mediaType === 'video' ? 'Export Video' : 'Export PNG'}
          </button>
        )}
      </div>
    </aside>
  );
}
