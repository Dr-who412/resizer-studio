import React from 'react';
import { CornerSettings } from '../types';
import { NumericInput } from '../../../common/NumericInput';

interface CornersSectionProps {
  settings: CornerSettings;
  maxRadius: number;
  onUpdate: (updated: Partial<CornerSettings>) => void;
}

export const CornersSection: React.FC<CornersSectionProps> = ({
  settings,
  maxRadius,
  onUpdate,
}) => {
  const { uniform, uniformRadius, perCorner } = settings;

  const quickPresets = [
    { label: '8px', value: 8 },
    { label: '16px', value: 16 },
    { label: '24px', value: 24 },
    { label: '48px', value: 48 },
    { label: 'Max', value: Math.floor(maxRadius) },
  ];

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Curve outer corners for app cards, avatars, or squircle icons.
        </p>

        <button
          type="button"
          onClick={() => onUpdate({ uniform: !uniform })}
          className="text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2"
        >
          {uniform ? 'Per-Corner Mode' : 'Uniform Mode'}
        </button>
      </div>

      {uniform ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Corner Radius</span>
            <div className="flex items-center gap-1.5">
              <NumericInput
                min={0}
                max={maxRadius}
                fallbackValue={0}
                value={uniformRadius}
                onChange={(val) => onUpdate({ uniformRadius: val })}
                className="w-16 px-2 py-1 text-xs font-mono font-bold text-right rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
              <span className="text-zinc-400">px</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={maxRadius}
            value={uniformRadius}
            onChange={(e) => onUpdate({ uniformRadius: parseInt(e.target.value, 10) || 0 })}
            className="w-full accent-zinc-900 dark:accent-zinc-100 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 mr-1">Presets:</span>
            {quickPresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onUpdate({ uniformRadius: Math.min(p.value, maxRadius) })}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                  uniformRadius === p.value
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Per-Corner 4 Numeric Inputs */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Top-Left</span>
              <div className="relative">
                <NumericInput
                  min={0}
                  max={maxRadius}
                  fallbackValue={0}
                  value={perCorner.topLeft}
                  onChange={(val) => onUpdate({
                    perCorner: { ...perCorner, topLeft: val }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">px</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Top-Right</span>
              <div className="relative">
                <NumericInput
                  min={0}
                  max={maxRadius}
                  fallbackValue={0}
                  value={perCorner.topRight}
                  onChange={(val) => onUpdate({
                    perCorner: { ...perCorner, topRight: val }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">px</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Bottom-Left</span>
              <div className="relative">
                <NumericInput
                  min={0}
                  max={maxRadius}
                  fallbackValue={0}
                  value={perCorner.bottomLeft}
                  onChange={(val) => onUpdate({
                    perCorner: { ...perCorner, bottomLeft: val }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">px</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Bottom-Right</span>
              <div className="relative">
                <NumericInput
                  min={0}
                  max={maxRadius}
                  fallbackValue={0}
                  value={perCorner.bottomRight}
                  onChange={(val) => onUpdate({
                    perCorner: { ...perCorner, bottomRight: val }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">px</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
