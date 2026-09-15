import React from 'react';
import { BackgroundSettings } from '../types';

interface BackgroundSectionProps {
  settings: BackgroundSettings;
  onUpdate: (updated: Partial<BackgroundSettings>) => void;
}

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  settings,
  onUpdate,
}) => {
  const { color, removeTransparency } = settings;

  const quickSwatches = [
    { label: 'White', hex: '#ffffff', border: true },
    { label: 'Black', hex: '#000000' },
    { label: 'Zinc Dark', hex: '#18181b' },
    { label: 'Slate', hex: '#0f172a' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Blue', hex: '#3b82f6' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Rose', hex: '#f43f5e' },
  ];

  return (
    <div className="space-y-4">
      {/* Remove Transparency Toggle */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
        <input
          type="checkbox"
          id="remove-transparency-toggle"
          checked={removeTransparency}
          onChange={(e) => onUpdate({ removeTransparency: e.target.checked })}
          className="w-4 h-4 mt-0.5 rounded accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
        />
        <label htmlFor="remove-transparency-toggle" className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
          <span className="font-semibold block text-zinc-900 dark:text-zinc-100 mb-0.5">
            Flatten transparency with solid background
          </span>
          Replaces alpha transparent pixels with a solid color. Required for iOS App Store icons.
        </label>
      </div>

      {/* Color Selection */}
      <div className="space-y-2.5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
          Background Fill Color
        </label>

        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden shadow-xs shrink-0 cursor-pointer">
            <input
              type="color"
              value={color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="absolute -inset-2 w-14 h-14 cursor-pointer p-0 border-0 bg-transparent"
            />
          </div>

          <input
            type="text"
            value={color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            placeholder="#ffffff"
            className="w-32 px-3 py-1.5 text-xs font-mono uppercase font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
          />

          <span className="text-xs text-zinc-400 font-mono">Hex code</span>
        </div>

        {/* Quick Palette */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {quickSwatches.map((s) => (
            <button
              key={s.hex}
              type="button"
              onClick={() => onUpdate({ color: s.hex })}
              title={s.label}
              className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 shadow-xs border ${
                s.border ? 'border-zinc-300 dark:border-zinc-700' : 'border-black/10 dark:border-white/10'
              } ${color.toLowerCase() === s.hex.toLowerCase() ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}
              style={{ backgroundColor: s.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
