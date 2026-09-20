import React, { useRef, useState } from 'react';
import { 
  Layers, 
  Download, 
  Trash2, 
  Plus, 
  Link2, 
  Unlink2, 
  Sparkles, 
  Check, 
  FileArchive, 
  Eye, 
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCcw,
  SlidersHorizontal,
  FileType
} from 'lucide-react';
import { 
  BatchImageItem, 
  BatchSizeMode, 
  BatchItemSettings, 
  ResizeSettings 
} from './types';

interface BatchResizeManagerProps {
  items: BatchImageItem[];
  activeItemId: string;
  batchMode: BatchSizeMode;
  onSelectActiveItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddFiles: (files: File[]) => void;
  onClearAll: () => void;
  onChangeBatchMode: (mode: BatchSizeMode) => void;
  
  // 'Same size for all' settings
  sameSettings: ResizeSettings;
  onUpdateSameSettings: (updated: Partial<ResizeSettings>) => void;
  fitMode: 'fit' | 'cover' | 'stretch';
  onChangeFitMode: (fit: 'fit' | 'cover' | 'stretch') => void;
  
  // 'Different sizes' settings
  onUpdateItemSettings: (id: string, updated: Partial<BatchItemSettings>) => void;
  onApplyPresetToItem: (id: string, width: number, height: number) => void;
  onApplyPresetToAll: (width: number, height: number) => void;
  onScaleItem: (id: string, factor: number) => void;
  onScaleAll: (factor: number) => void;
  
  // Downloads
  onDownloadItem: (item: BatchImageItem) => void;
  onDownloadAllZip: () => void;
  isExportingZip: boolean;

  // Format & Quality
  batchFormat: 'original' | 'image/png' | 'image/jpeg' | 'image/webp';
  onChangeBatchFormat: (fmt: 'original' | 'image/png' | 'image/jpeg' | 'image/webp') => void;
  batchQuality: number;
  onChangeBatchQuality: (q: number) => void;
}

export const BatchResizeManager: React.FC<BatchResizeManagerProps> = ({
  items,
  activeItemId,
  batchMode,
  onSelectActiveItem,
  onRemoveItem,
  onAddFiles,
  onClearAll,
  onChangeBatchMode,
  sameSettings,
  onUpdateSameSettings,
  fitMode,
  onChangeFitMode,
  onUpdateItemSettings,
  onApplyPresetToItem,
  onApplyPresetToAll,
  onScaleItem,
  onScaleAll,
  onDownloadItem,
  onDownloadAllZip,
  isExportingZip,
  batchFormat,
  onChangeBatchFormat,
  batchQuality,
  onChangeBatchQuality,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGlobalPresets, setShowGlobalPresets] = useState(false);

  const presets = [
    { label: 'Square (1:1)', w: 1080, h: 1080, tag: 'Instagram / Avatar' },
    { label: 'Full HD (16:9)', w: 1920, h: 1080, tag: 'Web / Display' },
    { label: 'Social OG', w: 1200, h: 630, tag: 'Twitter / OpenGraph' },
    { label: 'App Store Icon', w: 1024, h: 1024, tag: 'Apple Store' },
    { label: 'Play Store Icon', w: 512, h: 512, tag: 'Google Play' },
    { label: 'Standard Web', w: 800, h: 600, tag: '4:3 Standard' },
  ];

  const scalePresets = [
    { label: '25%', factor: 0.25 },
    { label: '50%', factor: 0.5 },
    { label: '75%', factor: 0.75 },
    { label: '150%', factor: 1.5 },
    { label: '200%', factor: 2.0 },
  ];

  const handleWidthInputSame = (val: number) => {
    const nextW = Math.max(1, val);
    if (sameSettings.lockAspectRatio && sameSettings.aspectRatio > 0) {
      const nextH = Math.round(nextW / sameSettings.aspectRatio);
      onUpdateSameSettings({ width: nextW, height: nextH });
    } else {
      onUpdateSameSettings({ width: nextW });
    }
  };

  const handleHeightInputSame = (val: number) => {
    const nextH = Math.max(1, val);
    if (sameSettings.lockAspectRatio && sameSettings.aspectRatio > 0) {
      const nextW = Math.round(nextH * sameSettings.aspectRatio);
      onUpdateSameSettings({ width: nextW, height: nextH });
    } else {
      onUpdateSameSettings({ height: nextH });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const arr = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            if (arr.length > 0) onAddFiles(arr);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Top Batch Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Title & Count */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Batch Image Resizer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {items.length} {items.length === 1 ? 'image' : 'images'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {batchMode === 'same' 
                  ? 'Resizing all images together to uniform dimensions' 
                  : 'Resizing each image with individual custom dimensions'}
              </p>
            </div>
          </div>

          {/* Center: Mode Switcher (Same Size vs Different Sizes) */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 self-start md:self-auto">
            <button
              type="button"
              id="mode-same-size-btn"
              onClick={() => onChangeBatchMode('same')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                batchMode === 'same'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>⊞ Same Size for All</span>
            </button>
            <button
              type="button"
              id="mode-different-size-btn"
              onClick={() => onChangeBatchMode('different')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                batchMode === 'different'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>☷ Different Sizes</span>
            </button>
          </div>

          {/* Right: Actions (Add, Download ZIP, Clear) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="batch-add-images-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Images</span>
            </button>

            <button
              type="button"
              id="batch-download-zip-btn"
              onClick={onDownloadAllZip}
              disabled={isExportingZip || items.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FileArchive className="w-4 h-4" />
              <span>{isExportingZip ? 'Packaging ZIP...' : `Download All (${items.length}) as ZIP`}</span>
            </button>

            <button
              type="button"
              id="batch-clear-all-btn"
              onClick={onClearAll}
              title="Remove all images"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Global Format & Quality Row */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Output Format:
            </span>
            <div className="flex items-center gap-1.5">
              {(['original', 'image/png', 'image/jpeg', 'image/webp'] as const).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onChangeBatchFormat(fmt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    batchFormat === fmt
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {fmt === 'original' ? 'Keep Original' : fmt.replace('image/', '').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {(batchFormat === 'image/jpeg' || batchFormat === 'image/webp') && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                Quality: {Math.round(batchQuality * 100)}%
              </span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={batchQuality}
                onChange={(e) => onChangeBatchQuality(parseFloat(e.target.value))}
                className="w-28 accent-emerald-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: SAME SIZE FOR ALL CONFIGURATION CARD */}
      {batchMode === 'same' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Uniform Target Size
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All {items.length} images will be resized to these exact dimensions
              </p>
            </div>

            {/* Quick Scale All Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">Scale All:</span>
              {scalePresets.map(sc => (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => onScaleAll(sc.factor)}
                  className="px-2 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Width / Height / Aspect Ratio Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label 
                htmlFor="batch-same-width" 
                className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1 font-medium"
              >
                Target Width
              </label>
              <div className="relative">
                <input
                  id="batch-same-width"
                  type="number"
                  min="1"
                  max="16384"
                  value={sameSettings.width}
                  onChange={(e) => handleWidthInputSame(parseInt(e.target.value, 10) || 1)}
                  className="w-full pl-3 pr-8 py-2 text-sm font-mono font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 pointer-events-none">
                  px
                </span>
              </div>
            </div>

            <div>
              <label 
                htmlFor="batch-same-height" 
                className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1 font-medium"
              >
                Target Height
              </label>
              <div className="relative">
                <input
                  id="batch-same-height"
                  type="number"
                  min="1"
                  max="16384"
                  value={sameSettings.height}
                  onChange={(e) => handleHeightInputSame(parseInt(e.target.value, 10) || 1)}
                  className="w-full pl-3 pr-8 py-2 text-sm font-mono font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 pointer-events-none">
                  px
                </span>
              </div>
            </div>

            {/* Lock Aspect Ratio Toggle & Fit Strategy */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="batch-same-lock-ratio"
                onClick={() => {
                  const nextLock = !sameSettings.lockAspectRatio;
                  onUpdateSameSettings({
                    lockAspectRatio: nextLock,
                    aspectRatio: sameSettings.width / sameSettings.height,
                  });
                }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  sameSettings.lockAspectRatio
                    ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                {sameSettings.lockAspectRatio ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
                <span>{sameSettings.lockAspectRatio ? 'Locked' : 'Unlocked'}</span>
              </button>

              {/* Fit Mode Selector */}
              <div className="flex items-center p-1 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                {(['fit', 'cover', 'stretch'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onChangeFitMode(mode)}
                    title={
                      mode === 'fit' 
                        ? 'Fit inside bounds (contain with padding)' 
                        : mode === 'cover' 
                          ? 'Fill bounds (center crop overflow)' 
                          : 'Direct stretch'
                    }
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-lg capitalize transition-colors ${
                      fitMode === mode
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono text-zinc-400">Popular Presets:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    onUpdateSameSettings({
                      width: p.w,
                      height: p.h,
                      aspectRatio: p.w / p.h,
                    });
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                    sameSettings.width === p.w && sameSettings.height === p.h
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] opacity-60">({p.w}×{p.h})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DIFFERENT SIZES PER IMAGE BANNER */}
      {batchMode === 'different' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Individual Sizing Enabled
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Set custom width and height on any card below, or use the quick bulk preset helpers
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-400 font-mono text-[11px]">Set All To:</span>
            <button
              type="button"
              onClick={() => onApplyPresetToAll(1080, 1080)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-emerald-500 font-mono text-[11px]"
            >
              1080×1080
            </button>
            <button
              type="button"
              onClick={() => onApplyPresetToAll(512, 512)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-emerald-500 font-mono text-[11px]"
            >
              512×512
            </button>
            <button
              type="button"
              onClick={() => onApplyPresetToAll(1920, 1080)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-emerald-500 font-mono text-[11px]"
            >
              1920×1080
            </button>
            <button
              type="button"
              onClick={() => onScaleAll(0.5)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-emerald-500 font-mono text-[11px]"
            >
              50% Scale
            </button>
          </div>
        </div>
      )}

      {/* THE IMAGE GALLERY / CARDS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
            Selected Images ({items.length})
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            Click any image to inspect or fine-tune
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const isActive = item.id === activeItemId;
            const targetW = batchMode === 'same' ? sameSettings.width : item.customSettings.width;
            const targetH = batchMode === 'same' ? sameSettings.height : item.customSettings.height;
            const isLock = item.customSettings.lockAspectRatio;

            return (
              <div
                key={item.id}
                onClick={() => onSelectActiveItem(item.id)}
                className={`group relative rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-150 p-3.5 flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
                }`}
              >
                {/* Active Indicator Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-bold text-zinc-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate" title={item.name}>
                      {item.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    title="Remove image"
                    className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail Preview Stage with transparent checkerboard */}
                <div className="relative aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-center mb-3">
                  <div 
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle, rgba(120,120,120,0.2) 1px, transparent 1px)`,
                      backgroundSize: '12px 12px',
                    }}
                  />
                  <img
                    src={item.processedResult?.dataUrl || item.sourceDataUrl}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain relative z-10 transition-transform group-hover:scale-[1.02] duration-200"
                  />

                  {/* Active inspect pill */}
                  {isActive && (
                    <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-emerald-500 text-white font-mono text-[10px] font-bold shadow-xs flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>ACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Metadata Dimensions Row */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span>Orig: {item.originalWidth}×{item.originalHeight}</span>
                    <span>{formatBytes(item.fileSizeBytes)}</span>
                  </div>

                  {/* If in DIFFERENT SIZES MODE: Input controls directly on the card */}
                  {batchMode === 'different' ? (
                    <div className="space-y-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="16384"
                            value={item.customSettings.width}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                              if (isLock && item.customSettings.aspectRatio > 0) {
                                const newH = Math.round(val / item.customSettings.aspectRatio);
                                onUpdateItemSettings(item.id, { width: val, height: newH });
                              } else {
                                onUpdateItemSettings(item.id, { width: val });
                              }
                            }}
                            className="w-full pl-2 pr-5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 pointer-events-none">w</span>
                        </div>

                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="16384"
                            value={item.customSettings.height}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                              if (isLock && item.customSettings.aspectRatio > 0) {
                                const newW = Math.round(val * item.customSettings.aspectRatio);
                                onUpdateItemSettings(item.id, { width: newW, height: val });
                              } else {
                                onUpdateItemSettings(item.id, { height: val });
                              }
                            }}
                            className="w-full pl-2 pr-5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 pointer-events-none">h</span>
                        </div>
                      </div>

                      {/* Quick Chips for this card */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateItemSettings(item.id, {
                              lockAspectRatio: !isLock,
                              aspectRatio: item.customSettings.width / item.customSettings.height,
                            });
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                            isLock 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {isLock ? <Link2 className="w-2.5 h-2.5" /> : <Unlink2 className="w-2.5 h-2.5" />}
                          <span>{isLock ? 'Lock' : 'Unlock'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onApplyPresetToItem(item.id, 1080, 1080)}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-400"
                          >
                            1:1
                          </button>
                          <button
                            type="button"
                            onClick={() => onScaleItem(item.id, 0.5)}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-400"
                          >
                            50%
                          </button>
                          <button
                            type="button"
                            onClick={() => onApplyPresetToItem(item.id, item.originalWidth, item.originalHeight)}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-400"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SAME SIZE MODE: Target display badge */
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="font-mono text-zinc-400">Target:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {targetW} × {targetH} px
                      </span>
                    </div>
                  )}

                  {/* Processed Output Status & Download */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {item.processedResult 
                        ? `${formatBytes(item.processedResult.fileSizeBytes)}`
                        : 'Ready'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadItem(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium text-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
