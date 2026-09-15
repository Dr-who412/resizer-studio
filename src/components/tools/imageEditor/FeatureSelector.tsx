import React from 'react';
import { 
  Scaling, 
  Crop as CropIcon, 
  Square, 
  Palette, 
  FileType, 
  SlidersHorizontal,
  Check,
  Plus
} from 'lucide-react';
import { ActiveFeatures, FeatureId } from './types';

interface FeatureSelectorProps {
  activeFeatures: ActiveFeatures;
  onToggleFeature: (id: FeatureId) => void;
}

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({
  activeFeatures,
  onToggleFeature,
}) => {
  const tools: Array<{
    id: FeatureId;
    label: string;
    icon: React.ElementType;
    isAlwaysActive?: boolean;
    description: string;
  }> = [
    {
      id: 'resize',
      label: 'Resize',
      icon: Scaling,
      isAlwaysActive: true,
      description: 'Scale width and height'
    },
    {
      id: 'crop',
      label: 'Crop',
      icon: CropIcon,
      description: 'Cut area or aspect ratio'
    },
    {
      id: 'corners',
      label: 'Rounded Corners',
      icon: Square,
      description: 'Smooth borders & radii'
    },
    {
      id: 'background',
      label: 'Background',
      icon: Palette,
      description: 'Solid fill or strip alpha'
    },
    {
      id: 'format',
      label: 'Format',
      icon: FileType,
      description: 'PNG, JPEG, or WebP'
    },
    {
      id: 'quality',
      label: 'Quality',
      icon: SlidersHorizontal,
      description: 'Compression & file size'
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
        <span className="font-mono text-[11px] uppercase tracking-wider">
          Active Editing Tools
        </span>
        <span className="text-[11px] font-mono text-zinc-400">
          Click to enable or disable
        </span>
      </div>

      {/* Horizontal pill list of tool selectors */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeFeatures[tool.id];

          return (
            <button
              key={tool.id}
              type="button"
              id={`tool-toggle-${tool.id}`}
              onClick={() => {
                if (!tool.isAlwaysActive) {
                  onToggleFeature(tool.id);
                }
              }}
              title={`${tool.label}: ${tool.description}${tool.isAlwaysActive ? ' (Default Core Tool)' : ''}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              {/* Status indicator: [✓] or [○] */}
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                isActive 
                  ? 'bg-emerald-500 text-white' 
                  : 'border border-zinc-400 dark:border-zinc-600 text-transparent'
              }`}>
                {isActive ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
              </span>

              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
