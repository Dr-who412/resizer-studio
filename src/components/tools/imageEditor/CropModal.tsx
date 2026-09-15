import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Maximize2, RotateCcw } from 'lucide-react';

interface CropModalProps {
  sourceImg: HTMLImageElement;
  onApplyCrop: (crop: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

type AspectRatioOption = 'free' | '1:1' | '9:16' | '16:9' | '4:3' | '3:2' | '2:1';

export const CropModal: React.FC<CropModalProps> = ({ sourceImg, onApplyCrop, onCancel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const naturalW = sourceImg.naturalWidth || sourceImg.width;
  const naturalH = sourceImg.naturalHeight || sourceImg.height;

  // Normalized crop bounds [0..1]
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });

  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');

  const applyRatio = (ratioStr: AspectRatioOption) => {
    setAspectRatio(ratioStr);
    if (ratioStr === 'free') return;

    let targetRatio = 1;
    switch (ratioStr) {
      case '1:1': targetRatio = 1; break;
      case '9:16': targetRatio = 9 / 16; break;
      case '16:9': targetRatio = 16 / 9; break;
      case '4:3': targetRatio = 4 / 3; break;
      case '3:2': targetRatio = 3 / 2; break;
      case '2:1': targetRatio = 2 / 1; break;
    }

    // Adjust width or height to match target aspect ratio relative to image natural dimensions
    const imgRatio = naturalW / naturalH;
    let newNormW = 0.8;
    let newNormH = 0.8;

    if (targetRatio >= 1) {
      newNormW = 0.8;
      newNormH = (newNormW * naturalW) / (targetRatio * naturalH);
      if (newNormH > 0.9) {
        newNormH = 0.9;
        newNormW = (newNormH * targetRatio * naturalH) / naturalW;
      }
    } else {
      newNormH = 0.8;
      newNormW = (newNormH * targetRatio * naturalH) / naturalW;
      if (newNormW > 0.9) {
        newNormW = 0.9;
        newNormH = (newNormW * naturalW) / (targetRatio * naturalH);
      }
    }

    setCrop({
      x: Math.max(0, (1 - newNormW) / 2),
      y: Math.max(0, (1 - newNormH) / 2),
      width: Math.min(1, newNormW),
      height: Math.min(1, newNormH),
    });
  };

  const handleSave = () => {
    onApplyCrop({
      x: Math.round(crop.x * naturalW),
      y: Math.round(crop.y * naturalH),
      width: Math.round(crop.width * naturalW),
      height: Math.round(crop.height * naturalH),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              Crop Image
            </h3>
            <p className="text-xs text-slate-500">
              Select an aspect ratio or drag sliders to adjust the crop region ({naturalW} x {naturalH} px).
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-2">
            Aspect Ratios:
          </span>
          {(['free', '1:1', '9:16', '16:9', '4:3', '3:2', '2:1'] as AspectRatioOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => applyRatio(opt)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-colors ${
                aspectRatio === opt
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {opt}
            </button>
          ))}
          <button
            onClick={() => {
              setCrop({ x: 0, y: 0, width: 1, height: 1 });
              setAspectRatio('free');
            }}
            className="ml-auto text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Box</span>
          </button>
        </div>

        {/* Preview Canvas with Visual Crop Box */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-auto bg-slate-100 dark:bg-slate-950">
          <div 
            ref={containerRef}
            className="relative max-w-full max-h-[50vh] border border-slate-300 dark:border-slate-800 rounded-lg overflow-hidden shadow-inner select-none"
          >
            <img
              src={sourceImg.src}
              alt="Crop target"
              className="max-h-[50vh] max-w-full object-contain block pointer-events-none"
            />
            {/* Shading overlay */}
            <div
              className="absolute border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all pointer-events-none"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.width * 100}%`,
                height: `${crop.height * 100}%`,
              }}
            >
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-emerald-500 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-emerald-500 -translate-x-1/2 translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 translate-x-1/2 translate-y-1/2" />
              
              {/* Rule of thirds lines */}
              <div className="absolute left-1/3 top-0 bottom-0 border-r border-white/30 border-dashed pointer-events-none" />
              <div className="absolute left-2/3 top-0 bottom-0 border-r border-white/30 border-dashed pointer-events-none" />
              <div className="absolute top-1/3 left-0 right-0 border-b border-white/30 border-dashed pointer-events-none" />
              <div className="absolute top-2/3 left-0 right-0 border-b border-white/30 border-dashed pointer-events-none" />
            </div>
          </div>

          {/* Interactive Sliders for Crop positioning */}
          <div className="w-full max-w-lg mt-4 grid grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Crop Width</span>
                <span>{Math.round(crop.width * naturalW)} px</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={crop.width}
                onChange={(e) => {
                  const w = parseFloat(e.target.value);
                  setCrop(prev => ({
                    ...prev,
                    width: w,
                    x: Math.min(prev.x, 1 - w)
                  }));
                }}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Crop Height</span>
                <span>{Math.round(crop.height * naturalH)} px</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={crop.height}
                onChange={(e) => {
                  const h = parseFloat(e.target.value);
                  setCrop(prev => ({
                    ...prev,
                    height: h,
                    y: Math.min(prev.y, 1 - h)
                  }));
                }}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>X Offset</span>
                <span>{Math.round(crop.x * naturalW)} px</span>
              </div>
              <input
                type="range"
                min="0"
                max={1 - crop.width}
                step="0.01"
                value={crop.x}
                onChange={(e) => setCrop(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Y Offset</span>
                <span>{Math.round(crop.y * naturalH)} px</span>
              </div>
              <input
                type="range"
                min="0"
                max={1 - crop.height}
                step="0.01"
                value={crop.y}
                onChange={(e) => setCrop(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Target Crop Area: {Math.round(crop.width * naturalW)} x {Math.round(crop.height * naturalH)} px
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
