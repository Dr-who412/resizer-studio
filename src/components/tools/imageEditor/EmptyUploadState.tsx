import React, { useRef } from 'react';
import { Upload, Layers, Sparkles, Clipboard, ArrowUpRight } from 'lucide-react';

interface EmptyUploadStateProps {
  onFilesSelect: (files: File[]) => void;
  onLoadSample: () => void;
}

export const EmptyUploadState: React.FC<EmptyUploadStateProps> = ({
  onFilesSelect,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (filesArr.length > 0) {
        onFilesSelect(filesArr);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (filesArr.length > 0) {
        onFilesSelect(filesArr);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
        onChange={handleInputChange}
        className="hidden"
        id="hidden-file-picker"
      />

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="empty-state-dropzone"
        className="group relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-zinc-900/60 rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          
          {/* Central Icon */}
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 duration-200">
            <Upload className="w-8 h-8 text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-500 transition-colors" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Drop single or multiple images here
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Select one or batch resize multiple images together to the same or different sizes
            </p>
          </div>

          {/* Primary Action Button inside dropzone */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              id="choose-image-btn"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Select Images (Single or Batch)</span>
            </button>
          </div>

          {/* Shortcuts & Capabilities info */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md">
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste with Ctrl+V / ⌘V</span>
            </span>
            <span>•</span>
            <span>Multiple files supported</span>
            <span>•</span>
            <span>PNG, JPG, WebP, SVG</span>
          </div>

        </div>
      </div>

      {/* Quick Sample Demo Link */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onLoadSample}
          id="load-sample-btn"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Don't have images? Load test samples</span>
          <ArrowUpRight className="w-3 h-3 text-zinc-400" />
        </button>
      </div>

    </div>
  );
};
