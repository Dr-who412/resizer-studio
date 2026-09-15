import React from 'react';
import { AdvancedSettings } from '../types';

interface AdvancedSectionProps {
  settings: AdvancedSettings;
  onUpdate: (updated: Partial<AdvancedSettings>) => void;
}

export const AdvancedSection: React.FC<AdvancedSectionProps> = ({
  settings,
  onUpdate,
}) => {
  const { fitMode, smoothing } = settings;

  const fitModes: Array<{ id: 'fit' | 'cover' | 'stretch'; label: string; desc: string }> = [
    { id: 'fit', label: 'Fit (Contain)', desc: 'Keeps entire image within frame' },
    { id: 'cover', label: 'Fill (Cover)', desc: 'Fills frame, trims overflow' },
    { id: 'stretch', label: 'Stretch', desc: 'Exact pixel scale to width & height' },
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Fit Mode */}
      <div className="space-y-2">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
          Canvas Fit Mode
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {fitModes.map((m) => {
            const isSelected = fitMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdate({ fitMode: m.id })}
                className={`p-2 rounded-lg text-left border transition-all ${
                  isSelected
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <span className="block font-mono font-semibold text-[11px]">{m.label}</span>
                <span className={`block text-[9px] truncate ${isSelected ? 'opacity-80' : 'text-zinc-400'}`}>
                  {m.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smoothing Mode */}
      <div className="space-y-2">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
          Scaling Interpolation
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ smoothing: 'high' })}
            className={`p-2 rounded-lg text-left border transition-all ${
              smoothing !== 'pixelated'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="block font-mono font-semibold text-[11px]">Bicubic Smoothing</span>
            <span className="block text-[9px] opacity-80">Smooth antialiased scale</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdate({ smoothing: 'pixelated' })}
            className={`p-2 rounded-lg text-left border transition-all ${
              smoothing === 'pixelated'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="block font-mono font-semibold text-[11px]">Nearest Neighbor</span>
            <span className="block text-[9px] opacity-80">Crisp for pixel art</span>
          </button>
        </div>
      </div>
    </div>
  );
};
