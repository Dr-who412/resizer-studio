import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Upload, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  FolderArchive, 
  ExternalLink,
  ShieldAlert,
  Eye,
  Info,
  Palette,
  Grid
} from 'lucide-react';
import { 
  iosIconSizes, 
  androidIconSizes, 
  requirementsService, 
  IconSizeSpec 
} from '../../../config/storeRequirements';
import { loadImage, processImage, triggerDownload } from '../../../services/imageProcessor';
import { exportAppIconsZip } from '../../../services/zipExporter';
import { AiImageGeneratorModal } from '../imageEditor/AiImageGeneratorModal';

type TargetPlatform = 'all' | 'ios' | 'android';
type AndroidMaskShape = 'circle' | 'squircle' | 'rounded-square' | 'teardrop';

export const AppIconGeneratorTool: React.FC = () => {
  const [platformFilter, setPlatformFilter] = useState<TargetPlatform>('all');
  const [masterImg, setMasterImg] = useState<HTMLImageElement | null>(null);
  const [masterDataUrl, setMasterDataUrl] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showSafeZoneGuide, setShowSafeZoneGuide] = useState<boolean>(true);

  // Background handling (iOS rejects alpha channels on App Store icon)
  const [fillSolidBg, setFillSolidBg] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#09090b');

  // Preview simulator states
  const [viewMode, setViewMode] = useState<'matrix' | 'simulator'>('matrix');
  const [androidMask, setAndroidMask] = useState<AndroidMaskShape>('circle');
  const [simDevice, setSimDevice] = useState<'ios' | 'android' | 'store'>('ios');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate minimalist geometric master icon mark
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Obsidian gradient
      const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(0.5, '#18181b');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Concentric circles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(512, 512, 380, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(512, 512, 280, 0, Math.PI * 2);
      ctx.stroke();

      // Precision Prism
      ctx.save();
      ctx.translate(512, 512);

      // Diamond Prism
      ctx.beginPath();
      ctx.moveTo(0, -180);
      ctx.lineTo(180, 0);
      ctx.lineTo(0, 180);
      ctx.lineTo(-180, 0);
      ctx.closePath();
      const prismGrad = ctx.createLinearGradient(-150, -150, 150, 150);
      prismGrad.addColorStop(0, '#10b981');
      prismGrad.addColorStop(1, '#059669');
      ctx.fillStyle = prismGrad;
      ctx.fill();

      // Inner Core
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.lineTo(90, 0);
      ctx.lineTo(0, 90);
      ctx.lineTo(-90, 0);
      ctx.closePath();
      ctx.fillStyle = '#09090b';
      ctx.fill();

      ctx.restore();

      const url = canvas.toDataURL('image/png');
      loadImage(url).then(img => {
        setMasterImg(img);
        setMasterDataUrl(url);
      });
    }
  }, []);

  const handleUploadMaster = (file: File) => {
    loadImage(file).then(img => {
      setMasterImg(img);
      setMasterDataUrl(img.src);
    });
  };

  const handleDownloadSingle = async (spec: IconSizeSpec) => {
    if (!masterImg) return;
    const res = await processImage(masterImg, {
      width: spec.size,
      height: spec.size,
      format: 'image/png',
      quality: 0.95,
      corners: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      removeTransparency: fillSolidBg,
      solidBackgroundColor: bgColor,
    });
    triggerDownload(res.blob, `${spec.filename || spec.name.toLowerCase().replace(/\s+/g, '-')}.png`);
  };

  const handleExportAllZip = async () => {
    if (!masterImg) return;
    setIsExportingZip(true);
    try {
      await exportAppIconsZip(masterImg, 'AppAssets', fillSolidBg, bgColor);
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const activeSpecs = [
    ...(platformFilter === 'all' || platformFilter === 'ios' ? iosIconSizes : []),
    ...(platformFilter === 'all' || platformFilter === 'android' ? androidIconSizes : []),
  ];

  return (
    <div className="space-y-4">
      
      {/* Studio Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Master Upload & Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Upload Master 1024px</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => e.target.files?.[0] && handleUploadMaster(e.target.files[0])}
            className="hidden"
          />

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <span>Master: 1024 × 1024 px</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {activeSpecs.length} Resolutions Generated
            </span>
          </div>
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Asset Matrix
            </button>
            <button
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                viewMode === 'simulator'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Device Simulator
            </button>
          </div>

          <button
            onClick={() => setShowAiModal(true)}
            className="p-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">AI Generate</span>
          </button>

          <button
            onClick={handleExportAllZip}
            disabled={isExportingZip}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>{isExportingZip ? 'Packaging ZIP...' : 'Export Asset Catalog (ZIP)'}</span>
          </button>

        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Inspector: Master Preview & Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Master Preview Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Master 1024 Asset
              </span>
              <button
                onClick={() => setShowSafeZoneGuide(!showSafeZoneGuide)}
                title="Toggle Safe Zone Guides"
                className={`p-1 rounded text-xs transition-colors ${
                  showSafeZoneGuide ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-zinc-400'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Icon Canvas with Safe Zone Guide */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-checkerboard shadow-inner">
              {masterDataUrl && (
                <img
                  src={masterDataUrl}
                  alt="Master Icon"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Safe Zone Grid Overlay */}
              {showSafeZoneGuide && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Apple squircle outer guide */}
                  <div className="w-[82%] h-[82%] rounded-[22.5%] border border-dashed border-white/40 shadow-xs" />
                  {/* Android circle inner guide */}
                  <div className="absolute w-[66%] h-[66%] rounded-full border border-emerald-400/50" />
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/70 text-white px-1.5 py-0.5 rounded">
                    Safe Zone
                  </div>
                </div>
              )}
            </div>

            {/* Store Compliance Notice */}
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-zinc-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <span>Apple and Google apply their own corner squircle masks automatically. Upload a full-bleed square with no rounded corners.</span>
            </div>
          </div>

          {/* Background Transparency Configuration */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Store Compliance (Alpha)
              </span>
              <input
                type="checkbox"
                id="solid-bg-check"
                checked={fillSolidBg}
                onChange={(e) => setFillSolidBg(e.target.checked)}
                className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 rounded cursor-pointer"
              />
            </div>

            <label htmlFor="solid-bg-check" className="text-xs text-zinc-600 dark:text-zinc-400 block cursor-pointer">
              Fill transparent areas with solid color (App Store rejects icons with alpha channels).
            </label>

            {fillSolidBg && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs font-mono uppercase rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          {/* Platform Filter */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
              Filter Platforms
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
              {(['all', 'ios', 'android'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`py-1 rounded font-medium text-[11px] uppercase transition-all ${
                    platformFilter === p
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {p === 'all' ? 'All' : p}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Content Stage: Matrix Grid or Simulator (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          
          {viewMode === 'matrix' ? (
            /* Matrix Grid: Monospaced, dense, professional tabular view */
            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 overflow-hidden shadow-xs">
              <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Asset Specification ({activeSpecs.length} items)</span>
                <span>Format: PNG 32-bit</span>
              </div>

              <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 max-h-[640px] overflow-y-auto custom-scrollbar">
                {activeSpecs.map((spec) => (
                  <div 
                    key={spec.id}
                    className="p-3 flex items-center justify-between hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                        {masterDataUrl && (
                          <img
                            src={masterDataUrl}
                            alt={spec.name}
                            className="w-full h-full object-contain rounded-md"
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                            {spec.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {spec.scale || spec.category}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          {spec.size} × {spec.size} px • {spec.platform === 'ios' ? 'Xcode .appiconset' : 'Android mipmap'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadSingle(spec)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0"
                      title={`Download ${spec.size}x${spec.size}px`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Simulator View: iOS Home Screen & Android Adaptive Launcher */
            <div className="space-y-4">
              
              {/* Simulator Device Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimDevice('ios')}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    simDevice === 'ios'
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  iOS Home Screen
                </button>
                <button
                  onClick={() => setSimDevice('android')}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    simDevice === 'android'
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Android Material You
                </button>
                <button
                  onClick={() => setSimDevice('store')}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    simDevice === 'store'
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  App Store Card
                </button>
              </div>

              {/* iOS Simulator Stage */}
              {simDevice === 'ios' && (
                <div className="relative w-full h-[520px] rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between p-8 text-white shadow-2xl">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-xs font-medium opacity-80">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">5G</span>
                      <div className="w-4 h-2 border border-white rounded-xs p-0.2">
                        <div className="w-full h-full bg-white rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Grid of Icons */}
                  <div className="grid grid-cols-4 gap-6 place-items-center py-6">
                    {/* User's Icon */}
                    <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div className="w-16 h-16 rounded-[22.5%] overflow-hidden shadow-lg border border-white/20 transition-transform group-hover:scale-105">
                        {masterDataUrl && <img src={masterDataUrl} alt="App" className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-[11px] font-medium tracking-tight">Your App</span>
                    </div>

                    {/* Dummy System Icons */}
                    {['Photos', 'Notes', 'Settings'].map((name) => (
                      <div key={name} className="flex flex-col items-center gap-1.5 opacity-40">
                        <div className="w-16 h-16 rounded-[22.5%] bg-zinc-700/80 border border-white/10 flex items-center justify-center text-xs font-mono">
                          {name[0]}
                        </div>
                        <span className="text-[11px] font-medium">{name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dock */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-3 flex items-center justify-around max-w-sm mx-auto w-full">
                    {['Phone', 'Safari', 'Messages', 'Music'].map((item) => (
                      <div key={item} className="w-12 h-12 rounded-[22.5%] bg-white/20 flex items-center justify-center text-xs opacity-60">
                        {item[0]}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Android Material You Stage */}
              {simDevice === 'android' && (
                <div className="relative w-full h-[520px] rounded-2xl bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between p-8 text-white shadow-2xl">
                  {/* Mask switcher bar */}
                  <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 self-center text-xs">
                    {(['circle', 'squircle', 'rounded-square', 'teardrop'] as const).map((mask) => (
                      <button
                        key={mask}
                        onClick={() => setAndroidMask(mask)}
                        className={`px-2.5 py-1 rounded-md capitalize ${
                          androidMask === mask ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                        }`}
                      >
                        {mask.replace('-', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Center Icon with Adaptive Mask */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className={`w-28 h-28 overflow-hidden shadow-2xl transition-all duration-300 ${
                      androidMask === 'circle' ? 'rounded-full' :
                      androidMask === 'squircle' ? 'rounded-[28%]' :
                      androidMask === 'rounded-square' ? 'rounded-2xl' :
                      'rounded-full rounded-br-none'
                    }`}>
                      {masterDataUrl && <img src={masterDataUrl} alt="App Icon" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-sm font-semibold tracking-tight">Your App</span>
                    <span className="text-[11px] font-mono text-zinc-500">Android Adaptive Icon Preview</span>
                  </div>

                  <div className="text-center text-[11px] text-zinc-500">
                    Material You adaptive masks automatically conform to user launcher theme.
                  </div>
                </div>
              )}

              {/* Store Listing Card Stage */}
              {simDevice === 'store' && (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-[22.5%] overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-700 shrink-0">
                      {masterDataUrl && <img src={masterDataUrl} alt="App" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        Your Application Name
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Developer Studio Inc.</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                        <span className="text-amber-500 font-semibold">★ 4.9</span>
                        <span>•</span>
                        <span>Developer Tools</span>
                        <span>•</span>
                        <span>4+ Age</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-5 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shrink-0">
                    GET
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* AI Modal */}
      {showAiModal && (
        <AiImageGeneratorModal
          currentImg={masterDataUrl}
          onApplyImage={(url) => {
            loadImage(url).then(img => {
              setMasterImg(img);
              setMasterDataUrl(url);
              setShowAiModal(false);
            });
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}

    </div>
  );
};
