import React from 'react';
import { ExternalLink } from 'lucide-react';
import { defaultAdsConfig, AdPlacementConfig } from '../../config/adsConfig';

interface AdBannerProps {
  placementKey: 'topLeaderboard' | 'inlineSection' | 'bottomBanner';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placementKey, className = '' }) => {
  const config: AdPlacementConfig = defaultAdsConfig[placementKey];
  if (!config || !config.enabled) return null;

  if (config.type === 'banner_top') {
    return (
      <aside 
        aria-label="Sponsor"
        className={`w-full bg-zinc-100/70 dark:bg-zinc-900/50 border-b border-zinc-200/70 dark:border-zinc-800/70 py-1.5 transition-colors ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Sponsor
            </span>
            <span className="truncate">{config.fallbackText}</span>
          </div>
          {config.sponsorUrl && (
            <a
              href={config.sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>{config.sponsorName || 'Visit'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </aside>
    );
  }

  if (config.type === 'banner_inline') {
    return (
      <aside 
        aria-label="Sponsor"
        className={`my-8 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
              SP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                  {config.sponsorName}
                </span>
                <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500">
                  Ad
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {config.fallbackText}
              </p>
            </div>
          </div>
          <a
            href={config.sponsorUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors inline-flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    );
  }

  // Bottom Banner
  return (
    <aside 
      aria-label="Sponsor"
      className={`w-full py-2 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-center text-zinc-500 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
          Sponsor
        </span>
        <span className="truncate">{config.fallbackText}</span>
        {config.sponsorUrl && (
          <a
            href={config.sponsorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-800 dark:text-zinc-200 hover:underline inline-flex items-center gap-1 ml-1"
          >
            <span>{config.sponsorName}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </aside>
  );
};
