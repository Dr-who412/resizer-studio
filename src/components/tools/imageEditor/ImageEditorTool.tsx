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
  Maximize2,
  Layers,
  FileArchive,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  loadImage, 
  processImage, 
  triggerDownload, 
  CornerRadii, 
  ProcessedImageResult 
} from '../../../services/imageProcessor';
import { exportBatchImagesZip } from '../../../services/zipExporter';
import { 
  ActiveFeatures, 
  FeatureId, 
  CropRect, 
  ImageMetadata, 
  ResizeSettings, 
  CornerSettings, 
  BackgroundSettings, 
  FormatQualitySettings, 
  AdvancedSettings,
  BatchImageItem,
  BatchSizeMode,
  BatchItemSettings
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
import { BatchResizeManager } from './BatchResizeManager';

export const ImageEditorTool: React.FC = () => {
  // Batch Items State
  const [batchItems, setBatchItems] = useState<BatchImageItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string>('');
  const [batchMode, setBatchMode] = useState<BatchSizeMode>('same');
  const [batchFormat, setBatchFormat] = useState<'original' | 'image/png' | 'image/jpeg' | 'image/webp'>('original');
  const [batchQuality, setBatchQuality] = useState<number>(0.92);
  const [fitMode, setFitMode] = useState<'fit' | 'cover' | 'stretch'>('fit');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // 'Same size for all' settings
  const [sameSettings, setSameSettings] = useState<ResizeSettings>({
    width: 1080,
    height: 1080,
    lockAspectRatio: true,
    aspectRatio: 1,
  });

  // Progressive Disclosure: Active Features State for the Active Image
  const [activeFeatures, setActiveFeatures] = useState<ActiveFeatures>({
    resize: true,
    crop: false,
    corners: false,
    background: false,
    format: false,
    quality: false,
  });

  const [cropRect, setCropRect] = useState<CropRect | undefined>(undefined);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);

  const [cornerSettings, setCornerSettings] = useState<CornerSettings>({
    uniform: true,
    uniformRadius: 24,
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
    fitMode: 'fit',
    smoothing: 'high',
  });

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Item Helper
  const activeItem = batchItems.find(i => i.id === activeItemId) || batchItems[0] || null;
  const activeItemIndex = activeItem ? batchItems.findIndex(i => i.id === activeItem.id) : -1;

  // Active item's current resize settings (mirrored for Left Inspector)
  const activeResizeSettings: ResizeSettings = activeItem 
    ? (batchMode === 'same'
        ? sameSettings
        : {
            width: activeItem.customSettings.width,
            height: activeItem.customSettings.height,
            lockAspectRatio: activeItem.customSettings.lockAspectRatio,
            aspectRatio: activeItem.customSettings.aspectRatio,
          })
    : sameSettings;

  const activeImageMeta: ImageMetadata | null = activeItem
    ? {
        name: activeItem.name,
        originalWidth: activeItem.originalWidth,
        originalHeight: activeItem.originalHeight,
        fileSizeBytes: activeItem.fileSizeBytes,
        mimeType: activeItem.mimeType,
      }
    : null;

  // Load multiple Files into the studio
  const handleLoadFiles = useCallback(async (files: File[]) => {
    const newItems: BatchImageItem[] = [];

    for (const file of files) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const img = await loadImage(dataUrl);
        const nw = img.naturalWidth || 1024;
        const nh = img.naturalHeight || 1024;
        const ratio = nw / nh;

        newItems.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          file,
          sourceImg: img,
          sourceDataUrl: dataUrl,
          originalWidth: nw,
          originalHeight: nh,
          originalAspectRatio: ratio,
          fileSizeBytes: file.size,
          mimeType: file.type || 'image/png',
          customSettings: {
            width: nw,
            height: nh,
            lockAspectRatio: true,
            aspectRatio: ratio,
          },
        });
      } catch (err) {
        console.error('Failed to load image file:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      setBatchItems(prev => {
        const next = [...prev, ...newItems];
        return next;
      });

      setActiveItemId(prev => prev || newItems[0].id);

      // If this is the very first batch, initialize sameSettings to the first item's dimensions
      setSameSettings(prev => {
        if (batchItems.length === 0) {
          return {
            width: newItems[0].originalWidth,
            height: newItems[0].originalHeight,
            lockAspectRatio: true,
            aspectRatio: newItems[0].originalAspectRatio,
          };
        }
        return prev;
      });
    }
  }, [batchItems.length]);

  // Generate Sample Vector Test Images (Loads 3 distinct images for instant batch demo)
  const handleLoadSample = useCallback(async () => {
    const samples: Array<{ name: string; w: number; h: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }> = [
      {
        name: 'sample_banner_1920x1080.png',
        w: 1920,
        h: 1080,
        draw: (ctx, w, h) => {
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#1e293b');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Emerald aura
          const rad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 600);
          rad.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          rad.addColorStop(1, 'rgba(16, 185, 129, 0)');
          ctx.fillStyle = rad;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 600, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 84px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Banner Asset', w / 2, h / 2 - 30);

          ctx.fillStyle = '#10b981';
          ctx.font = '500 36px sans-serif';
          ctx.fillText('1920 × 1080 Display', w / 2, h / 2 + 50);
        },
      },
      {
        name: 'sample_square_1080x1080.png',
        w: 1080,
        h: 1080,
        draw: (ctx, w, h) => {
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#18181b');
          grad.addColorStop(1, '#27272a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(w / 2 - 140, h / 2 - 140, 280, 280, 56);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 120px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('S', w / 2, h / 2);
        },
      },
      {
        name: 'sample_icon_512x512.png',
        w: 512,
        h: 512,
        draw: (ctx, w, h) => {
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#312e81');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          ctx.fillStyle = '#6366f1';
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 160, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 72px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('APP', w / 2, h / 2);
        },
      },
    ];

    const newItems: BatchImageItem[] = [];
    for (const s of samples) {
      const cvs = document.createElement('canvas');
      cvs.width = s.w;
      cvs.height = s.h;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        s.draw(ctx, s.w, s.h);
        const dataUrl = cvs.toDataURL('image/png');
        const img = await loadImage(dataUrl);
        newItems.push({
          id: `sample-${s.w}-${s.h}-${Math.random().toString(36).substr(2, 6)}`,
          name: s.name,
          sourceImg: img,
          sourceDataUrl: dataUrl,
          originalWidth: s.w,
          originalHeight: s.h,
          originalAspectRatio: s.w / s.h,
          fileSizeBytes: 32000,
          mimeType: 'image/png',
          customSettings: {
            width: s.w,
            height: s.h,
            lockAspectRatio: true,
            aspectRatio: s.w / s.h,
          },
        });
      }
    }

    setBatchItems(newItems);
    setActiveItemId(newItems[0].id);
    setSameSettings({
      width: 1080,
      height: 1080,
      lockAspectRatio: true,
      aspectRatio: 1,
    });
  }, []);

  // Clipboard Paste Handler (Supports single or multiple images)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const files: File[] = [];
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) files.push(blob);
          }
        }
        if (files.length > 0) {
          handleLoadFiles(files);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleLoadFiles]);

  // Toggle Features for Active Item
  const handleToggleFeature = (id: FeatureId) => {
    if (id === 'resize') return;
    setActiveFeatures(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Re-process All Images in Batch (Debounced and optimized)
  const batchDependenciesKey = batchItems
    .map(i => `${i.id}-${i.customSettings.width}x${i.customSettings.height}-${i.customSettings.lockAspectRatio}`)
    .join('|');

  useEffect(() => {
    if (batchItems.length === 0) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const updated = await Promise.all(
          batchItems.map(async (item) => {
            const isThisActive = item.id === activeItemId;
            const targetW = batchMode === 'same' ? sameSettings.width : item.customSettings.width;
            const targetH = batchMode === 'same' ? sameSettings.height : item.customSettings.height;

            let targetFormat: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png';
            if (batchFormat === 'original') {
              if (item.mimeType === 'image/jpeg') targetFormat = 'image/jpeg';
              else if (item.mimeType === 'image/webp') targetFormat = 'image/webp';
              else targetFormat = 'image/png';
            } else {
              targetFormat = batchFormat;
            }

            // Options for active item (support rounded corners, background, crop)
            let appliedCorners: CornerRadii = { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };
            let appliedRemoveTrans = false;
            let appliedBgColor = '#ffffff';
            let appliedCrop = undefined;

            if (isThisActive) {
              if (activeFeatures.corners) {
                appliedCorners = cornerSettings.uniform
                  ? {
                      topLeft: cornerSettings.uniformRadius,
                      topRight: cornerSettings.uniformRadius,
                      bottomRight: cornerSettings.uniformRadius,
                      bottomLeft: cornerSettings.uniformRadius,
                    }
                  : cornerSettings.perCorner;
              }
              if (activeFeatures.background) {
                appliedRemoveTrans = backgroundSettings.removeTransparency;
                appliedBgColor = backgroundSettings.color;
              }
              if (activeFeatures.crop && cropRect) {
                appliedCrop = cropRect;
              }
            }

            const res = await processImage(item.sourceImg, {
              width: targetW,
              height: targetH,
              format: targetFormat,
              quality: batchQuality,
              corners: appliedCorners,
              removeTransparency: appliedRemoveTrans,
              solidBackgroundColor: appliedBgColor,
              crop: appliedCrop,
              fitMode: fitMode,
              smoothing: advancedSettings.smoothing,
            });

            return {
              ...item,
              processedResult: res,
            };
          })
        );

        if (isMounted) {
          setBatchItems(updated);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Batch processing error:', err);
        if (isMounted) setIsProcessing(false);
      }
    }, 40);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    batchDependenciesKey,
    batchItems.length,
    batchMode,
    sameSettings.width,
    sameSettings.height,
    fitMode,
    batchFormat,
    batchQuality,
    activeItemId,
    activeFeatures,
    cornerSettings,
    backgroundSettings,
    cropRect,
    advancedSettings.smoothing,
  ]);

  // Remove individual item
  const handleRemoveItem = (id: string) => {
    setBatchItems(prev => {
      const filtered = prev.filter(i => i.id !== id);
      if (activeItemId === id && filtered.length > 0) {
        setActiveItemId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear all items
  const handleClearAll = () => {
    setBatchItems([]);
    setActiveItemId('');
    setCropRect(undefined);
  };

  // Update item custom settings (Different mode)
  const handleUpdateItemSettings = (id: string, updated: Partial<BatchItemSettings>) => {
    setBatchItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            customSettings: {
              ...item.customSettings,
              ...updated,
            },
          };
        }
        return item;
      })
    );
  };

  // Apply preset to individual item
  const handleApplyPresetToItem = (id: string, width: number, height: number) => {
    handleUpdateItemSettings(id, {
      width,
      height,
      aspectRatio: width / height,
    });
  };

  // Apply preset to all items
  const handleApplyPresetToAll = (width: number, height: number) => {
    if (batchMode === 'same') {
      setSameSettings({
        width,
        height,
        lockAspectRatio: sameSettings.lockAspectRatio,
        aspectRatio: width / height,
      });
    } else {
      setBatchItems(prev =>
        prev.map(item => ({
          ...item,
          customSettings: {
            ...item.customSettings,
            width,
            height,
            aspectRatio: width / height,
          },
        }))
      );
    }
  };

  // Scale individual item
  const handleScaleItem = (id: string, factor: number) => {
    const item = batchItems.find(i => i.id === id);
    if (!item) return;
    const newW = Math.max(1, Math.round(item.originalWidth * factor));
    const newH = Math.max(1, Math.round(item.originalHeight * factor));
    handleUpdateItemSettings(id, {
      width: newW,
      height: newH,
      aspectRatio: item.originalAspectRatio,
    });
  };

  // Scale all items
  const handleScaleAll = (factor: number) => {
    if (batchMode === 'same') {
      const newW = Math.max(1, Math.round(sameSettings.width * factor));
      const newH = Math.max(1, Math.round(sameSettings.height * factor));
      setSameSettings(prev => ({
        ...prev,
        width: newW,
        height: newH,
      }));
    } else {
      setBatchItems(prev =>
        prev.map(item => ({
          ...item,
          customSettings: {
            ...item.customSettings,
            width: Math.max(1, Math.round(item.originalWidth * factor)),
            height: Math.max(1, Math.round(item.originalHeight * factor)),
          },
        }))
      );
    }
  };

  // Download individual item
  const handleDownloadItem = (item: BatchImageItem) => {
    if (!item.processedResult) return;
    const targetW = batchMode === 'same' ? sameSettings.width : item.customSettings.width;
    const targetH = batchMode === 'same' ? sameSettings.height : item.customSettings.height;

    let ext = 'png';
    if (batchFormat === 'original') {
      ext = item.mimeType === 'image/jpeg' ? 'jpg' : item.mimeType === 'image/webp' ? 'webp' : 'png';
    } else {
      ext = batchFormat.replace('image/', '').replace('jpeg', 'jpg');
    }

    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-${targetW}x${targetH}.${ext}`;
    triggerDownload(item.processedResult.blob, filename);
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    if (batchItems.length === 0) return;
    setIsExportingZip(true);
    try {
      const exportList: Array<{ filename: string; blob: Blob }> = [];

      for (const item of batchItems) {
        const targetW = batchMode === 'same' ? sameSettings.width : item.customSettings.width;
        const targetH = batchMode === 'same' ? sameSettings.height : item.customSettings.height;

        let ext = 'png';
        if (batchFormat === 'original') {
          ext = item.mimeType === 'image/jpeg' ? 'jpg' : item.mimeType === 'image/webp' ? 'webp' : 'png';
        } else {
          ext = batchFormat.replace('image/', '').replace('jpeg', 'jpg');
        }

        const baseName = item.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}-${targetW}x${targetH}.${ext}`;

        if (item.processedResult) {
          exportList.push({ filename, blob: item.processedResult.blob });
        } else {
          const res = await processImage(item.sourceImg, {
            width: targetW,
            height: targetH,
            format: batchFormat === 'original'
              ? (item.mimeType === 'image/jpeg' ? 'image/jpeg' : item.mimeType === 'image/webp' ? 'image/webp' : 'image/png')
              : batchFormat,
            quality: batchQuality,
            corners: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
            removeTransparency: false,
            solidBackgroundColor: '#ffffff',
            fitMode: fitMode,
          });
          exportList.push({ filename, blob: res.blob });
        }
      }

      await exportBatchImagesZip(exportList, `resized-images-${batchMode}-size.zip`);
    } catch (err) {
      console.error('Failed to export batch zip:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Reset active image original size
  const handleResetActiveOriginalSize = () => {
    if (!activeItem) return;
    if (batchMode === 'same') {
      setSameSettings({
        width: activeItem.originalWidth,
        height: activeItem.originalHeight,
        lockAspectRatio: true,
        aspectRatio: activeItem.originalAspectRatio,
      });
    } else {
      handleUpdateItemSettings(activeItem.id, {
        width: activeItem.originalWidth,
        height: activeItem.originalHeight,
        lockAspectRatio: true,
        aspectRatio: activeItem.originalAspectRatio,
      });
    }
  };

  // If no images uploaded yet: Render Empty Upload State
  if (batchItems.length === 0) {
    return (
      <EmptyUploadState
        onFilesSelect={handleLoadFiles}
        onLoadSample={handleLoadSample}
      />
    );
  }

  const activeTargetW = batchMode === 'same' ? sameSettings.width : (activeItem?.customSettings.width || 1080);
  const activeTargetH = batchMode === 'same' ? sameSettings.height : (activeItem?.customSettings.height || 1080);
  const maxCornerRadius = Math.floor(Math.min(activeTargetW, activeTargetH) / 2);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const arr = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            if (arr.length > 0) handleLoadFiles(arr);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Top Main Studio Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Left: Add / Upload & Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            id="open-new-image-btn"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>Add More Images</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {batchItems.length} {batchItems.length === 1 ? 'image' : 'images'} in studio
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {batchMode === 'same' ? 'Same Size (Uniform)' : 'Different Sizes (Custom)'}
            </span>
          </div>
        </div>

        {/* Right: Studio Actions */}
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

          {/* Quick Clear All */}
          <button
            type="button"
            onClick={handleClearAll}
            id="clear-image-btn"
            title="Close all images"
            className="p-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-red-500 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>

          {/* Download Action Button in Header */}
          {batchItems.length > 1 ? (
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={isExportingZip || batchItems.length === 0}
              id="header-download-zip-btn"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>{isExportingZip ? 'Zipping...' : `Download All (${batchItems.length}) ZIP`}</span>
            </button>
          ) : (
            activeItem && (
              <button
                type="button"
                onClick={() => handleDownloadItem(activeItem)}
                disabled={!activeItem.processedResult || isProcessing}
                id="header-download-btn"
                className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
            )
          )}
        </div>

      </div>

      {/* BATCH RESIZE MANAGEMENT PANEL (ALWAYS DISPLAYED FOR MULTI OR SINGLE IMAGES) */}
      <BatchResizeManager
        items={batchItems}
        activeItemId={activeItemId}
        batchMode={batchMode}
        onSelectActiveItem={(id) => setActiveItemId(id)}
        onRemoveItem={handleRemoveItem}
        onAddFiles={handleLoadFiles}
        onClearAll={handleClearAll}
        onChangeBatchMode={(mode) => setBatchMode(mode)}
        sameSettings={sameSettings}
        onUpdateSameSettings={(upd) => setSameSettings(prev => ({ ...prev, ...upd }))}
        fitMode={fitMode}
        onChangeFitMode={(f) => setFitMode(f)}
        onUpdateItemSettings={handleUpdateItemSettings}
        onApplyPresetToItem={handleApplyPresetToItem}
        onApplyPresetToAll={handleApplyPresetToAll}
        onScaleItem={handleScaleItem}
        onScaleAll={handleScaleAll}
        onDownloadItem={handleDownloadItem}
        onDownloadAllZip={handleDownloadAllZip}
        isExportingZip={isExportingZip}
        batchFormat={batchFormat}
        onChangeBatchFormat={(f) => setBatchFormat(f)}
        batchQuality={batchQuality}
        onChangeBatchQuality={(q) => setBatchQuality(q)}
      />

      {/* DETAILED ACTIVE IMAGE FINE-TUNING & PREVIEW SECTION */}
      {activeItem && (
        <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-5">
          
          {/* Active Image Sub-header with Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Active Inspector & Live Preview
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
                    {activeItem.name}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">
                    ({activeItemIndex + 1} of {batchItems.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Previous / Next Active Image Buttons */}
            {batchItems.length > 1 && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const prevIdx = (activeItemIndex - 1 + batchItems.length) % batchItems.length;
                    setActiveItemId(batchItems[prevIdx].id);
                  }}
                  title="Previous image"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (activeItemIndex + 1) % batchItems.length;
                    setActiveItemId(batchItems[nextIdx].id);
                  }}
                  title="Next image"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Feature Selector Toolbar for active image */}
          <FeatureSelector
            activeFeatures={activeFeatures}
            onToggleFeature={handleToggleFeature}
          />

          {/* Studio Grid: Inspector (Left) & Large Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Sections */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 1. RESIZE SECTION */}
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
                      {batchMode === 'same' ? 'Uniform Dimensions' : 'Active Image Dimensions'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {batchMode === 'same' ? 'Applies to All' : 'Only Active Image'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <ResizeSection
                    settings={activeResizeSettings}
                    imageMeta={activeImageMeta}
                    onUpdate={(upd) => {
                      if (batchMode === 'same') {
                        setSameSettings(prev => ({ ...prev, ...upd }));
                      } else {
                        handleUpdateItemSettings(activeItem.id, upd);
                      }
                    }}
                    onResetOriginal={handleResetActiveOriginalSize}
                  />
                </div>
              </div>

              {/* 2. CROP SECTION */}
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
                      Crop (Active Image)
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
                      imageMeta={activeImageMeta}
                      onOpenCropModal={() => setShowCropModal(true)}
                      onResetCrop={() => setCropRect(undefined)}
                    />
                  </div>
                )}
              </div>

              {/* 3. ROUNDED CORNERS SECTION */}
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

              {/* 4. BACKGROUND SECTION */}
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

              {/* 5. ADVANCED OPTIONS (COLLAPSIBLE) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  id="advanced-options-toggle"
                  className="w-full py-2 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center justify-between rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Advanced scaling options</span>
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

            {/* Right Column: Preview Stage */}
            <div className="lg:col-span-7 space-y-4">
              <PreviewStage
                processedResult={activeItem.processedResult || null}
                sourceDataUrl={activeItem.sourceDataUrl}
                targetWidth={activeTargetW}
                targetHeight={activeTargetH}
                format={
                  batchFormat === 'original'
                    ? activeItem.mimeType
                    : batchFormat
                }
                quality={batchQuality}
                isProcessing={isProcessing}
                onDropFile={(file) => handleLoadFiles([file])}
              />

              {/* Individual Download for Active Image */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleDownloadItem(activeItem)}
                  disabled={!activeItem.processedResult || isProcessing}
                  id="main-download-button"
                  className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all duration-150 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download This Image ({activeTargetW} × {activeTargetH} px)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Visual Crop Modal */}
      {showCropModal && activeItem && (
        <CropModal
          sourceImg={activeItem.sourceImg}
          onApplyCrop={(crop) => {
            setCropRect(crop);
            setShowCropModal(false);
          }}
          onCancel={() => setShowCropModal(false)}
        />
      )}

      {/* AI Retouch Modal */}
      {showAiModal && activeItem && (
        <AiImageGeneratorModal
          currentImg={activeItem.processedResult ? activeItem.processedResult.dataUrl : activeItem.sourceDataUrl}
          onApplyImage={(url) => {
            loadImage(url).then(img => {
              const nw = img.naturalWidth || 1024;
              const nh = img.naturalHeight || 1024;
              setBatchItems(prev =>
                prev.map(item => {
                  if (item.id === activeItem.id) {
                    return {
                      ...item,
                      sourceImg: img,
                      sourceDataUrl: url,
                      originalWidth: nw,
                      originalHeight: nh,
                      originalAspectRatio: nw / nh,
                    };
                  }
                  return item;
                })
              );
              setShowAiModal(false);
            });
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}

    </div>
  );
};
