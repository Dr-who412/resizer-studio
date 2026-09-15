import React from 'react';
import { Crop as CropIcon, RotateCcw, Sparkles } from 'lucide-react';
import { CropRect, ImageMetadata } from '../types';

interface CropSectionProps {
  cropRect: CropRect | undefined;
  imageMeta: ImageMetadata | null;
  onOpenCropModal: () => void;
  onResetCrop: () => void;
}

export const CropSection: React.FC<CropSectionProps> = ({
  cropRect,
  imageMeta,
  onOpenCropModal,
  onResetCrop,
}) => {
  const isCropped = Boolean(cropRect);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Trim edges, frame a focal point, or lock to standard ratios (1:1, 16:9, 4:3).
        </p>

        {isCropped && (
          <button
            type="button"
            onClick={onResetCrop}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Crop</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onOpenCropModal}
          id="open-crop-editor-btn"
          className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          <CropIcon className="w-4 h-4" />
          <span>{isCropped ? 'Edit Crop Box' : 'Open Visual Crop Tool'}</span>
        </button>
      </div>

      {/* Current Crop Details */}
      {isCropped && cropRect && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono flex items-center justify-between text-zinc-600 dark:text-zinc-400">
          <span>Active Crop Area:</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {cropRect.width} × {cropRect.height} px
          </span>
        </div>
      )}
    </div>
  );
};
