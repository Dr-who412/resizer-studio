import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, SplitSquareVertical, Eye, Layers } from 'lucide-react';
import { ProcessedImageResult } from '../../../services/imageProcessor';

interface PreviewStageProps {
  processedResult: ProcessedImageResult | null;
  sourceDataUrl: string | null;
  targetWidth: number;
  targetHeight: number;
  format: string;
  quality: number;
  isProcessing: boolean;
  onDropFile: (file: File) => void;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  processedResult,
  sourceDataUrl,
  targetWidth,
  targetHeight,
  format,
  quality,
  isProcessing,
  onDropFile,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'result' | 'split' | 'original'>('result');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onDropFile(e.dataTransfer.files[0]);
    }
  };

  const extName = format.replace('image/', '').toUpperCase();

  return (
    <div className="space-y-3">
      
      {/* Stage Toolbar */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* View Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('result')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'result'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Output Preview
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Split Compare
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'original'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Original
          </button>
        </div>

        {/* Zoom Controls HUD */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.2, z - 0.15))}
            className="p-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1.5 text-zinc-700 dark:text-zinc-300 min-w-[42px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.15))}
            className="p-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-1 rounded hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Reset Zoom to 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        id="image-preview-viewport"
        className={`relative w-full h-[460px] sm:h-[540px] rounded-2xl bg-zinc-100 dark:bg-zinc-950 border overflow-hidden flex items-center justify-center p-6 select-none shadow-inner transition-all duration-200 ${
          isDraggingOver 
            ? 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/20' 
            : 'border-zinc-200 dark:border-zinc-800'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0, 0, 0, 0.04) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.04) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.04) 75%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
        }}
      >
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute top-4 left-4 z-30 bg-zinc-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Updating preview...</span>
          </div>
        )}

        {/* Drop indicator overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center text-white font-medium text-sm">
            Drop new image to replace
          </div>
        )}

        {/* Stage Content */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.12s ease-out',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          {processedResult ? (
            viewMode === 'split' ? (
              <div className="relative overflow-hidden shadow-2xl rounded-sm border border-zinc-300 dark:border-zinc-700 max-h-[440px] sm:max-h-[500px]">
                {/* Result layer (bottom) */}
                <img
                  src={processedResult.dataUrl}
                  alt="Result"
                  className="max-h-[440px] sm:max-h-[500px] object-contain block pointer-events-none"
                />

                {/* Original layer (top, clipped by split slider) */}
                {sourceDataUrl && (
                  <div
                    className="absolute inset-0 overflow-hidden border-r-2 border-emerald-500"
                    style={{ width: `${splitPos}%` }}
                  >
                    <img
                      src={sourceDataUrl}
                      alt="Original"
                      className="max-h-[440px] sm:max-h-[500px] object-contain block pointer-events-none max-w-none"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                )}

                {/* Transparent range slider for dragging split line */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPos}
                  onChange={(e) => setSplitPos(parseInt(e.target.value, 10))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  title="Drag horizontally to compare"
                />
              </div>
            ) : viewMode === 'original' ? (
              sourceDataUrl && (
                <img
                  src={sourceDataUrl}
                  alt="Original"
                  className="max-h-[440px] sm:max-h-[500px] object-contain shadow-2xl rounded-sm border border-zinc-300 dark:border-zinc-700"
                />
              )
            ) : (
              <img
                src={processedResult.dataUrl}
                alt="Processed"
                className="max-h-[440px] sm:max-h-[500px] object-contain shadow-2xl rounded-sm border border-zinc-300 dark:border-zinc-700"
              />
            )
          ) : (
            <div className="text-zinc-400 text-xs font-mono">Loading preview...</div>
          )}
        </div>

        {/* Bottom Metadata Pill HUD */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {targetWidth} × {targetHeight} px
          </span>
          <span>•</span>
          <span className="font-semibold uppercase">{extName}</span>
          {processedResult && (
            <>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatFileSize(processedResult.fileSizeBytes)}
              </span>
            </>
          )}
        </div>

        {/* Split comparison hint */}
        {viewMode === 'split' && (
          <div className="absolute top-4 right-4 z-20 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-lg">
            Drag slider left ⟷ right
          </div>
        )}
      </div>

    </div>
  );
};
