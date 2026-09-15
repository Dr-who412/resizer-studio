import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Crop as CropIcon, 
  Scaling, 
  Square, 
  Palette, 
  FileType, 
  SlidersHorizontal,
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Check,
  Plus,
  X,
  Sliders,
  Maximize2
} from 'lucide-react';
import { 
  loadImage, 
  processImage, 
  triggerDownload, 
  CornerRadii, 
  ProcessedImageResult 
} from '../../../services/imageProcessor';
import { 
  ActiveFeatures, 
  FeatureId, 
  CropRect, 
  ImageMetadata, 
  ResizeSettings, 
  CornerSettings, 
  BackgroundSettings, 
  FormatQualitySettings, 
  AdvancedSettings 
} from './types';
import { EmptyUploadState } from './EmptyUploadState';
import { FeatureSelector } from './FeatureSelector';
import { ResizeSection } from './sections/ResizeSection';
import { CropSection } from './sections/CropSection';
import { CornersSection } from './sections/CornersSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { FormatQualitySection } from './sections/FormatQualitySection';
import { AdvancedSection } from './sections/AdvancedSection';
import { PreviewStage } from './PreviewStage';
import { CropModal } from './CropModal';
import { AiImageGeneratorModal } from './AiImageGeneratorModal';

export const ImageEditorTool: React.FC = () => {
  // Source Image State
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMetadata | null>(null);

  // Progressive Disclosure: Active Features State
  // Default: ONLY 'resize' is active! All other features inactive by default.
  const [activeFeatures, setActiveFeatures] = useState<ActiveFeatures>({
    resize: true,
    crop: false,
    corners: false,
    background: false,
    format: false,
    quality: false,
  });

  // Feature Settings (Preserved even when toggled off)
  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>({
    width: 1080,
    height: 1080,
    lockAspectRatio: true,
    aspectRatio: 1,
  });

  const [cropRect, setCropRect] = useState<CropRect | undefined>(undefined);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);

  const [cornerSettings, setCornerSettings] = useState<CornerSettings>({
    uniform: true,
    uniformRadius: 24, // Smart default when first enabled
    perCorner: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 },
  });

  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    color: '#ffffff',
    removeTransparency: true,
  });

  const [formatQualitySettings, setFormatQualitySettings] = useState<FormatQualitySettings>({
    format: 'image/png',
    quality: 0.92,
  });

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    fitMode: 'stretch',
    smoothing: 'high',
  });

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Processed Output State
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a File into the studio
  const handleLoadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      loadImage(dataUrl).then((img) => {
        const nw = img.naturalWidth || 1024;
        const nh = img.naturalHeight || 1024;
        const ratio = nw / nh;

        setSourceImg(img);
        setSourceDataUrl(dataUrl);
        setImageMeta({
          name: file.name,
          originalWidth: nw,
          originalHeight: nh,
          fileSizeBytes: file.size,
          mimeType: file.type || 'image/png',
        });

        // Smart defaults: match original width & height, preserve aspect ratio
        setResizeSettings({
          width: nw,
          height: nh,
          lockAspectRatio: true,
          aspectRatio: ratio,
        });

        // Set output format matching original file when possible
        let detectedFormat: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png';
        if (file.type === 'image/jpeg') detectedFormat = 'image/jpeg';
        else if (file.type === 'image/webp') detectedFormat = 'image/webp';

        setFormatQualitySettings(prev => ({
          ...prev,
          format: detectedFormat,
        }));

        setCropRect(undefined);
      }).catch((err) => {
        console.error('Failed to load image file:', err);
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // Generate Sample Vector Test Image
  const handleLoadSample = useCallback(() => {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1080;
    sampleCanvas.height = 1080;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      // Dark slate gradient canvas
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Radial glowing aura
      const radial = ctx.createRadialGradient(540, 540, 50, 540, 540, 480);
      radial.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      radial.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(540, 540, 480, 0, Math.PI * 2);
      ctx.fill();

      // Precision geometry circles
      [380, 280, 180, 80].forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(540, 540, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = idx === 1 ? 3 : 1.5;
        ctx.stroke();
      });

      // Central modern glyph
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(460, 460, 160, 160, 36);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', 540, 540);

      const sampleUrl = sampleCanvas.toDataURL('image/png');
      loadImage(sampleUrl).then((img) => {
        setSourceImg(img);
        setSourceDataUrl(sampleUrl);
        setImageMeta({
          name: 'sample_asset_1080x1080.png',
          originalWidth: 1080,
          originalHeight: 1080,
          fileSizeBytes: 24800,
          mimeType: 'image/png',
        });
        setResizeSettings({
          width: 1080,
          height: 1080,
          lockAspectRatio: true,
          aspectRatio: 1,
        });
        setCropRect(undefined);
      });
    }
  }, []);

  // Global Clipboard Paste Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              handleLoadFile(blob);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleLoadFile]);

  // Toggle a Feature on or off
  const handleToggleFeature = (id: FeatureId) => {
    if (id === 'resize') return; // Resize is always active
    setActiveFeatures(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Re-process Image Pipeline (Debounced)
  useEffect(() => {
    if (!sourceImg) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        // Build processing options based on what is active:
        // When a feature is inactive, its effect is bypassed in processing,
        // but its settings are PRESERVED in memory!
        const appliedCrop = activeFeatures.crop && cropRect ? cropRect : undefined;

        let appliedCorners: CornerRadii = { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };
        if (activeFeatures.corners) {
          if (cornerSettings.uniform) {
            appliedCorners = {
              topLeft: cornerSettings.uniformRadius,
              topRight: cornerSettings.uniformRadius,
              bottomRight: cornerSettings.uniformRadius,
              bottomLeft: cornerSettings.uniformRadius,
            };
          } else {
            appliedCorners = cornerSettings.perCorner;
          }
        }

        const appliedRemoveTransparency = activeFeatures.background
          ? backgroundSettings.removeTransparency
          : false;

        const appliedSolidColor = activeFeatures.background
          ? backgroundSettings.color
          : '#ffffff';

        const appliedFormat = activeFeatures.format
          ? formatQualitySettings.format
          : (imageMeta?.mimeType === 'image/jpeg' ? 'image/jpeg' : imageMeta?.mimeType === 'image/webp' ? 'image/webp' : 'image/png');

        const appliedQuality = activeFeatures.quality
          ? formatQualitySettings.quality
          : 0.92;

        const result = await processImage(sourceImg, {
          width: resizeSettings.width,
          height: resizeSettings.height,
          format: appliedFormat,
          quality: appliedQuality,
          corners: appliedCorners,
          removeTransparency: appliedRemoveTransparency,
          solidBackgroundColor: appliedSolidColor,
          crop: appliedCrop,
          fitMode: advancedSettings.fitMode,
          smoothing: advancedSettings.smoothing,
        });

        if (isMounted) {
          setProcessedResult(result);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Image processing pipeline failed:', err);
        if (isMounted) setIsProcessing(false);
      }
    }, 40);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    sourceImg,
    activeFeatures,
    resizeSettings.width,
    resizeSettings.height,
    cropRect,
    cornerSettings,
    backgroundSettings,
    formatQualitySettings,
    advancedSettings,
    imageMeta?.mimeType,
  ]);

  // Primary Download Handler
  const handleDownload = () => {
    if (!processedResult) return;
    const currentFormat = activeFeatures.format
      ? formatQualitySettings.format
      : (imageMeta?.mimeType === 'image/jpeg' ? 'image/jpeg' : imageMeta?.mimeType === 'image/webp' ? 'image/webp' : 'image/png');
    
    const ext = currentFormat === 'image/png' ? 'png' : currentFormat === 'image/jpeg' ? 'jpg' : 'webp';
    const baseName = imageMeta?.name ? imageMeta.name.replace(/\.[^/.]+$/, '') : 'resized-asset';
    const filename = `${baseName}-${resizeSettings.width}x${resizeSettings.height}.${ext}`;
    triggerDownload(processedResult.blob, filename);
  };

  // Reset to original dimensions
  const handleResetOriginalSize = () => {
    if (!imageMeta) return;
    setResizeSettings({
      width: imageMeta.originalWidth,
      height: imageMeta.originalHeight,
      lockAspectRatio: true,
      aspectRatio: imageMeta.originalWidth / imageMeta.originalHeight,
    });
  };

  // If no image uploaded yet: Render simple, clean Empty State
  if (!sourceImg) {
    return (
      <EmptyUploadState
        onFileSelect={handleLoadFile}
        onLoadSample={handleLoadSample}
      />
    );
  }

  const currentMime = activeFeatures.format
    ? formatQualitySettings.format
    : (imageMeta?.mimeType === 'image/jpeg' ? 'image/jpeg' : imageMeta?.mimeType === 'image/webp' ? 'image/webp' : 'image/png');

  const extLabel = currentMime.replace('image/', '').toUpperCase();
  const maxCornerRadius = Math.floor(Math.min(resizeSettings.width, resizeSettings.height) / 2);

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* File & Metadata Info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            id="open-new-image-btn"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Open Image</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleLoadFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {imageMeta && (
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="truncate max-w-[180px] font-medium text-zinc-800 dark:text-zinc-200">
                {imageMeta.name}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span>{imageMeta.originalWidth}×{imageMeta.originalHeight}px</span>
            </div>
          )}
        </div>

        {/* Studio Actions */}
        <div className="flex items-center gap-2">
          {/* AI Retouch modal trigger */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            id="ai-retouch-btn"
            className="p-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">AI Retouch</span>
          </button>

          {/* Quick Clear / Reset Canvas */}
          <button
            type="button"
            onClick={() => {
              setSourceImg(null);
              setSourceDataUrl(null);
              setImageMeta(null);
              setProcessedResult(null);
            }}
            id="clear-image-btn"
            title="Close image"
            className="p-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Close</span>
          </button>

          {/* Primary Download Button in Header */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!processedResult || isProcessing}
            id="header-download-btn"
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Image</span>
          </button>
        </div>

      </div>

      {/* Feature Selector Toolbar */}
      <FeatureSelector
        activeFeatures={activeFeatures}
        onToggleFeature={handleToggleFeature}
      />

      {/* Main Studio Grid: Controls (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Inspector Column (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* ========================================================================= */}
          {/* 1. RESIZE SECTION (ACTIVE BY DEFAULT) */}
          {/* ========================================================================= */}
          <div 
            id="section-card-resize"
            className="rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Resize
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Default Core Tool
                </span>
              </div>
            </div>

            <div className="p-4">
              <ResizeSection
                settings={resizeSettings}
                imageMeta={imageMeta}
                onUpdate={(upd) => setResizeSettings(prev => ({ ...prev, ...upd }))}
                onResetOriginal={handleResetOriginalSize}
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CROP SECTION (PROGRESSIVE DISCLOSURE) */}
          {/* ========================================================================= */}
          <div 
            id="section-card-crop"
            className="rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200"
          >
            <div 
              onClick={() => handleToggleFeature('crop')}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeFeatures.crop 
                    ? 'bg-emerald-500 text-white' 
                    : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                }`}>
                  {activeFeatures.crop ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </span>
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Crop
                </span>
              </div>

              <span className="text-xs font-medium text-zinc-400">
                {activeFeatures.crop ? 'Active' : 'Inactive'}
              </span>
            </div>

            {activeFeatures.crop && (
              <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <CropSection
                  cropRect={cropRect}
                  imageMeta={imageMeta}
                  onOpenCropModal={() => setShowCropModal(true)}
                  onResetCrop={() => setCropRect(undefined)}
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 3. ROUNDED CORNERS SECTION (PROGRESSIVE DISCLOSURE) */}
          {/* ========================================================================= */}
          <div 
            id="section-card-corners"
            className="rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200"
          >
            <div 
              onClick={() => handleToggleFeature('corners')}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeFeatures.corners 
                    ? 'bg-emerald-500 text-white' 
                    : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                }`}>
                  {activeFeatures.corners ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </span>
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Rounded Corners
                </span>
              </div>

              <span className="text-xs font-medium text-zinc-400">
                {activeFeatures.corners ? `${cornerSettings.uniformRadius}px` : 'Inactive'}
              </span>
            </div>

            {activeFeatures.corners && (
              <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <CornersSection
                  settings={cornerSettings}
                  maxRadius={maxCornerRadius}
                  onUpdate={(upd) => setCornerSettings(prev => ({ ...prev, ...upd }))}
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 4. BACKGROUND SECTION (PROGRESSIVE DISCLOSURE) */}
          {/* ========================================================================= */}
          <div 
            id="section-card-background"
            className="rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200"
          >
            <div 
              onClick={() => handleToggleFeature('background')}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeFeatures.background 
                    ? 'bg-emerald-500 text-white' 
                    : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                }`}>
                  {activeFeatures.background ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </span>
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Background
                </span>
              </div>

              <span className="text-xs font-medium text-zinc-400">
                {activeFeatures.background ? (
                  <span className="inline-block w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: backgroundSettings.color }} />
                ) : 'Inactive'}
              </span>
            </div>

            {activeFeatures.background && (
              <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <BackgroundSection
                  settings={backgroundSettings}
                  onUpdate={(upd) => setBackgroundSettings(prev => ({ ...prev, ...upd }))}
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 5. FORMAT SECTION (PROGRESSIVE DISCLOSURE) */}
          {/* ========================================================================= */}
          <div 
            id="section-card-format"
            className="rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200"
          >
            <div 
              onClick={() => handleToggleFeature('format')}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeFeatures.format 
                    ? 'bg-emerald-500 text-white' 
                    : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                }`}>
                  {activeFeatures.format ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </span>
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Format
                </span>
              </div>

              <span className="text-xs font-mono font-semibold text-zinc-500 uppercase">
                {activeFeatures.format ? formatQualitySettings.format.replace('image/', '') : 'Auto / Original'}
              </span>
            </div>

            {activeFeatures.format && (
              <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <FormatQualitySection
                  settings={formatQualitySettings}
                  showFormatOnly={!activeFeatures.quality}
                  onUpdate={(upd) => setFormatQualitySettings(prev => ({ ...prev, ...upd }))}
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 6. QUALITY SECTION (PROGRESSIVE DISCLOSURE) */}
          {/* ========================================================================= */}
          <div 
            id="section-card-quality"
            className="rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200"
          >
            <div 
              onClick={() => handleToggleFeature('quality')}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeFeatures.quality 
                    ? 'bg-emerald-500 text-white' 
                    : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                }`}>
                  {activeFeatures.quality ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </span>
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Quality
                </span>
              </div>

              <span className="text-xs font-mono font-semibold text-zinc-500">
                {activeFeatures.quality ? `${Math.round(formatQualitySettings.quality * 100)}%` : 'Standard (92%)'}
              </span>
            </div>

            {activeFeatures.quality && (
              <div className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <FormatQualitySection
                  settings={formatQualitySettings}
                  showQualityOnly={true}
                  onUpdate={(upd) => setFormatQualitySettings(prev => ({ ...prev, ...upd }))}
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ADVANCED OPTIONS (COLLAPSIBLE) */}
          {/* ========================================================================= */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              id="advanced-options-toggle"
              className="w-full py-2 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center justify-between rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Advanced options</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800">
                <AdvancedSection
                  settings={advancedSettings}
                  onUpdate={(upd) => setAdvancedSettings(prev => ({ ...prev, ...upd }))}
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Preview Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Large, Prominent Image Preview */}
          <PreviewStage
            processedResult={processedResult}
            sourceDataUrl={sourceDataUrl}
            targetWidth={resizeSettings.width}
            targetHeight={resizeSettings.height}
            format={currentMime}
            quality={formatQualitySettings.quality}
            isProcessing={isProcessing}
            onDropFile={handleLoadFile}
          />

          {/* Primary Large Download Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!processedResult || isProcessing}
              id="main-download-button"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Image ({resizeSettings.width} × {resizeSettings.height} {extLabel})</span>
            </button>

            <p className="text-center text-[11px] font-mono text-zinc-400 mt-2">
              Free, instantaneous browser export. No data uploaded to servers.
            </p>
          </div>

        </div>

      </div>

      {/* Visual Crop Modal */}
      {showCropModal && sourceImg && (
        <CropModal
          sourceImg={sourceImg}
          onApplyCrop={(crop) => {
            setCropRect(crop);
            setShowCropModal(false);
          }}
          onCancel={() => setShowCropModal(false)}
        />
      )}

      {/* AI Retouch Modal */}
      {showAiModal && (
        <AiImageGeneratorModal
          currentImg={processedResult ? processedResult.dataUrl : sourceDataUrl}
          onApplyImage={(url) => {
            loadImage(url).then(img => {
              setSourceImg(img);
              setSourceDataUrl(url);
              setResizeSettings(prev => ({
                ...prev,
                width: img.naturalWidth || 1024,
                height: img.naturalHeight || 1024,
                aspectRatio: (img.naturalWidth || 1024) / (img.naturalHeight || 1024),
              }));
              setShowAiModal(false);
            });
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}

    </div>
  );
};
