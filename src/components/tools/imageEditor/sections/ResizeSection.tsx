import React from 'react';
import { Link2, Unlink2, RotateCcw, ArrowRight } from 'lucide-react';
import { ResizeSettings, ImageMetadata } from '../types';

interface ResizeSectionProps {
  settings: ResizeSettings;
  imageMeta: ImageMetadata | null;
  onUpdate: (updated: Partial<ResizeSettings>) => void;
  onResetOriginal: () => void;
}

export const ResizeSection: React.FC<ResizeSectionProps> = ({
  settings,
  imageMeta,
  onUpdate,
  onResetOriginal,
}) => {
  const { width, height, lockAspectRatio, aspectRatio } = settings;

  const handleWidthInput = (val: number) => {
    const nextW = Math.max(1, val);
    if (lockAspectRatio && aspectRatio > 0) {
      const nextH = Math.round(nextW / aspectRatio);
      onUpdate({ width: nextW, height: nextH });
    } else {
      onUpdate({ width: nextW });
    }
  };

  const handleHeightInput = (val: number) => {
    const nextH = Math.max(1, val);
    if (lockAspectRatio && aspectRatio > 0) {
      const nextW = Math.round(nextH * aspectRatio);
      onUpdate({ width: nextW, height: nextH });
    } else {
      onUpdate({ height: nextH });
    }
  };

  const presets = [
    { label: '1080 × 1080', w: 1080, h: 1080, tag: 'Square' },
    { label: '1920 × 1080', w: 1920, h: 1080, tag: '16:9 HD' },
    { label: '1200 × 630', w: 1200, h: 630, tag: 'Social' },
    { label: '512 × 512', w: 512, h: 512, tag: 'Icon' },
  ];

  return (
    <div className="space-y-4">
      
      {/* Width & Height Inputs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label 
            htmlFor="resize-width-input" 
            className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1 font-medium"
          >
            Width
          </label>
          <div className="relative">
            <input
              id="resize-width-input"
              type="number"
              min="1"
              max="16384"
              value={width}
              onChange={(e) => handleWidthInput(parseInt(e.target.value, 10) || 1)}
              className="w-full pl-3 pr-8 py-2 text-sm font-mono font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 pointer-events-none">
              px
            </span>
          </div>
        </div>

        <div>
          <label 
            htmlFor="resize-height-input" 
            className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1 font-medium"
          >
            Height
          </label>
          <div className="relative">
            <input
              id="resize-height-input"
              type="number"
              min="1"
              max="16384"
              value={height}
              onChange={(e) => handleHeightInput(parseInt(e.target.value, 10) || 1)}
              className="w-full pl-3 pr-8 py-2 text-sm font-mono font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 pointer-events-none">
              px
            </span>
          </div>
        </div>
      </div>

      {/* Aspect Ratio Lock Toggle & Info Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="aspect-ratio-checkbox"
            checked={lockAspectRatio}
            onChange={(e) => onUpdate({ lockAspectRatio: e.target.checked })}
            className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100 border-zinc-300 dark:border-zinc-700 cursor-pointer"
          />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            {lockAspectRatio ? <Link2 className="w-3.5 h-3.5 text-emerald-500" /> : <Unlink2 className="w-3.5 h-3.5 text-zinc-400" />}
            <span>Keep aspect ratio</span>
          </span>
        </label>

        {/* Small Dimension comparison badge */}
        {imageMeta && (
          <div className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <span>Original: {imageMeta.originalWidth} × {imageMeta.originalHeight}</span>
            <ArrowRight className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{width} × {height}</span>
          </div>
        )}
      </div>

      {/* Quick Common Presets */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
          Popular Sizes
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {presets.map((preset) => {
            const isMatch = width === preset.w && height === preset.h;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onUpdate({
                    width: preset.w,
                    height: preset.h,
                    aspectRatio: preset.w / preset.h,
                  });
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-all text-left flex flex-col justify-between border ${
                  isMatch
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="font-semibold text-[11px]">{preset.label}</span>
                <span className={`text-[10px] ${isMatch ? 'opacity-80' : 'text-zinc-400'}`}>
                  {preset.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset to Original Button */}
      {imageMeta && (width !== imageMeta.originalWidth || height !== imageMeta.originalHeight) && (
        <button
          type="button"
          onClick={onResetOriginal}
          className="text-xs font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 inline-flex items-center gap-1.5 transition-colors pt-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to original size ({imageMeta.originalWidth} × {imageMeta.originalHeight} px)</span>
        </button>
      )}

    </div>
  );
};
