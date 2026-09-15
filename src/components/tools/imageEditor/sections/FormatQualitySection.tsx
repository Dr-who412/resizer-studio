import React from 'react';
import { FormatQualitySettings } from '../types';

interface FormatQualitySectionProps {
  settings: FormatQualitySettings;
  showQualityOnly?: boolean;
  showFormatOnly?: boolean;
  onUpdate: (updated: Partial<FormatQualitySettings>) => void;
}

export const FormatQualitySection: React.FC<FormatQualitySectionProps> = ({
  settings,
  showQualityOnly = false,
  showFormatOnly = false,
  onUpdate,
}) => {
  const { format, quality } = settings;

  const formats: Array<{
    id: 'image/png' | 'image/jpeg' | 'image/webp';
    label: string;
    desc: string;
  }> = [
    { id: 'image/png', label: 'PNG', desc: 'Lossless & Transparency' },
    { id: 'image/jpeg', label: 'JPEG', desc: 'Photos & Smaller Size' },
    { id: 'image/webp', label: 'WEBP', desc: 'Modern High Compression' },
  ];

  const showFormatControls = !showQualityOnly;
  const showQualityControls = !showFormatOnly && (format === 'image/jpeg' || format === 'image/webp');

  return (
    <div className="space-y-4">
      {/* Format Selector */}
      {showFormatControls && (
        <div className="space-y-2">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
            Output File Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {formats.map((f) => {
              const isSelected = format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdate({ format: f.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span className="block font-mono font-bold text-xs">{f.label}</span>
                  <span className={`block text-[10px] truncate ${isSelected ? 'opacity-80' : 'text-zinc-400'}`}>
                    {f.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quality Slider (Visible for JPEG and WebP) */}
      {showQualityControls && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Quality Compression</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {Math.round(quality * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.10"
            max="1.00"
            step="0.01"
            value={quality}
            onChange={(e) => onUpdate({ quality: parseFloat(e.target.value) })}
            className="w-full accent-zinc-900 dark:accent-zinc-100 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>Smaller File (10%)</span>
            <span>Balanced (80-92%)</span>
            <span>Maximum Quality (100%)</span>
          </div>
        </div>
      )}

      {/* Informational note for PNG when quality is inspected */}
      {format === 'image/png' && !showFormatOnly && (
        <p className="text-[11px] text-zinc-500 italic">
          PNG format uses lossless compression automatically for maximum pixel fidelity.
        </p>
      )}
    </div>
  );
};
