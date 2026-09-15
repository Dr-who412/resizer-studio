import React from 'react';
import { 
  Crop, 
  Smartphone, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen,
  FolderArchive,
  Terminal,
  Cpu,
  Check
} from 'lucide-react';

interface OverviewPageProps {
  onSelectTool: (toolId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onSelectTool }) => {
  const tools = [
    {
      id: 'image-editor',
      title: 'Image Studio & Processing',
      description: 'Precision dimension resizing, aspect ratio locks, uniform and per-corner radii, and alpha channel stripping for store-compliant assets.',
      icon: Crop,
      badge: 'Canvas Engine',
      features: ['Numeric dimension controls', 'Independent 4-corner radii', 'Solid RGB background injection', 'Lossless & WebP encoding'],
      cta: 'Open Studio'
    },
    {
      id: 'store-screenshots',
      title: 'Store Screenshot Mockups',
      description: 'Generate high-resolution preview graphics framed in official iPhone 16 Pro, iPad Pro, and Android flagship hardware bezels.',
      icon: Smartphone,
      badge: 'Apple & Play Store Specs',
      features: ['Dynamic Island & punch hole bezels', 'Real-time compliance validation', 'Curated studio backdrops', 'Batch export ZIP for all screen sizes'],
      cta: 'Create Mockups'
    },
    {
      id: 'app-icons',
      title: 'App Icon Production Matrix',
      description: 'Transform a single 1024×1024 master into full Xcode AppIcon.appiconset packages and Android adaptive mipmap directory structures.',
      icon: Layers,
      badge: 'Xcode & Android ZIP',
      features: ['Full resolution density catalog', 'iOS & Android home screen simulator', 'Safe zone grid overlays', 'One-click ZIP asset package'],
      cta: 'Generate Icons'
    }
  ];

  return (
    <div className="space-y-12 py-4">
      
      {/* Hero Section */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono border border-zinc-200/80 dark:border-zinc-800">
          <Cpu className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Client-Side Processing • Zero Cloud Uploads</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Mobile Developer Asset Studio
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          A dedicated toolkit for iOS and Android engineers to format, inspect, and package app assets according to Apple App Store Connect and Google Play Console requirements.
        </p>
      </div>

      {/* 3 Main Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              id={`tool-card-${tool.id}`}
              onClick={() => onSelectTool(tool.id)}
              className="p-5 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 flex flex-col justify-between space-y-5 transition-all shadow-xs cursor-pointer group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  {tool.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <span>{tool.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-zinc-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Specifications Quick Access */}
      <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Official Store Resolution Matrix
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Inspect verified dimension limits, aspect ratios, file size ceilings, and alpha channel requirements for App Store and Google Play.
          </p>
        </div>

        <button
          onClick={() => onSelectTool('requirements')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors shrink-0 self-start md:self-auto"
        >
          View Store Specifications
        </button>
      </div>

    </div>
  );
};
