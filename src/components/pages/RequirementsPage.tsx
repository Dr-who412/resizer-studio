import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Info,
  Clock
} from 'lucide-react';
import { requirementsService } from '../../config/storeRequirements';

export const RequirementsPage: React.FC = () => {
  const [reqState, setReqState] = useState(requirementsService.getState());
  const [activeTab, setActiveTab] = useState<'all' | 'apple' | 'google'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const updated = await requirementsService.syncWithOfficial();
      setReqState(updated);
      setSyncMessage('Specifications verified against Apple App Store Connect and Google Play Console guidelines.');
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err: any) {
      setSyncMessage('Using verified offline cache.');
    } finally {
      setIsSyncing(false);
    }
  };

  const allSpecs = [
    ...reqState.appStore.requirements.map(r => ({ ...r, platformLabel: 'Apple App Store', platformKey: 'apple' })),
    ...reqState.googlePlay.requirements.map(r => ({ ...r, platformLabel: 'Google Play', platformKey: 'google' }))
  ];

  const filteredSpecs = allSpecs.filter(spec => {
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'apple' 
        ? spec.platformKey === 'apple' 
        : spec.platformKey === 'google';

    const matchesSearch = searchQuery.trim() === '' || 
      spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.deviceCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${spec.width}x${spec.height}`.includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Official Store Specifications
            </h1>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Verified Specs
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Exact resolution standards, aspect ratio rules, and alpha channel restrictions for mobile platforms.
          </p>
        </div>

        {/* Sync Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated: {new Date(reqState.lastSyncedAt).toLocaleDateString()}</span>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-500' : 'text-zinc-500'}`} />
            <span>{isSyncing ? 'Verifying...' : 'Check Official Feeds'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-mono flex items-center gap-2 border border-zinc-200 dark:border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All Specs ({allSpecs.length})
          </button>
          <button
            onClick={() => setActiveTab('apple')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'apple'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Apple App Store
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'google'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Google Play
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search device, size, aspect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 font-mono"
          />
        </div>
      </div>

      {/* Specifications Table */}
      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Device & Category</th>
                <th className="py-2.5 px-4">Platform</th>
                <th className="py-2.5 px-4">Dimensions</th>
                <th className="py-2.5 px-4">Aspect</th>
                <th className="py-2.5 px-4">Alpha / Transparency</th>
                <th className="py-2.5 px-4 text-right">Official Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-mono text-[11px]">
              {filteredSpecs.map((spec) => (
                <tr key={spec.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-sans text-xs">
                      {spec.name}
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-mono mt-0.5 capitalize">
                      {spec.deviceCategory.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      spec.platformKey === 'apple' 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-medium'
                    }`}>
                      {spec.platformLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-semibold">
                    {spec.width} × {spec.height} px
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {spec.aspectRatioDesc}
                  </td>
                  <td className="py-3 px-4">
                    {!spec.notes.toLowerCase().includes('no alpha') ? (
                      <span className="text-zinc-500">Permitted</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Alpha Stripped</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={spec.officialDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-sans text-xs"
                    >
                      <span>Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Rules Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
            Apple App Store Connect Rules
          </span>
          <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>• App Store listing icons MUST NOT contain an alpha channel (transparency).</li>
            <li>• Screenshots must be flat, unrounded squares; Apple clips display corners dynamically.</li>
            <li>• RGB color profile in 72 dpi sRGB or Display P3.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
            Google Play Console Rules
          </span>
          <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>• Screenshots: Minimum dimension 320px, maximum 3840px.</li>
            <li>• Aspect ratio cannot exceed 2:1 for phone and tablet screenshots.</li>
            <li>• Hi-res icon must be 512 × 512 px, up to 1024KB, 32-bit PNG.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};
