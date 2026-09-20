import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Upload, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Type, 
  Palette, 
  Sparkles, 
  ExternalLink, 
  FolderArchive,
  RefreshCw,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { 
  requirementsService, 
  ScreenshotRequirement 
} from '../../../config/storeRequirements';
import { loadImage, triggerDownload } from '../../../services/imageProcessor';
import { exportScreenshotsZip } from '../../../services/zipExporter';
import { AiImageGeneratorModal } from '../imageEditor/AiImageGeneratorModal';
import { NumericInput } from '../../common/NumericInput';

type PlatformChoice = 'appStore' | 'googlePlay';

export const ScreenshotGeneratorTool: React.FC = () => {
  const reqState = requirementsService.getState();
  const [platform, setPlatform] = useState<PlatformChoice>('appStore');
  const [selectedSpecId, setSelectedSpecId] = useState<string>('apple-iphone-6-7-portrait');
  
  // Custom or Preset Dimensions
  const [width, setWidth] = useState<number>(1290);
  const [height, setHeight] = useState<number>(2796);

  // Screenshot input image
  const [screenshotImg, setScreenshotImg] = useState<HTMLImageElement | null>(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);

  // Mockup framing & styling
  const [frameStyle, setFrameStyle] = useState<'iphone-dynamic' | 'android-punch' | 'tablet' | 'none'>('iphone-dynamic');
  const [mockupScale, setMockupScale] = useState<number>(0.84);
  const [mockupOffsetY, setMockupOffsetY] = useState<number>(90);

  // Background options
  const [bgType, setBgType] = useState<'gradient' | 'solid'>('gradient');
  const [gradientPreset, setGradientPreset] = useState<string>('obsidian');
  const [solidColor, setSolidColor] = useState<string>('#09090b');

  // Text / Typography overlay (Clean, design-first copywriting)
  const [titleText, setTitleText] = useState<string>('Designed for High Performance');
  const [subtitleText, setSubtitleText] = useState<string>('Real-time synchronization and offline client-side architecture');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'bottom'>('top');
  const [titleFontSize, setTitleFontSize] = useState<number>(68);

  // Output format
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg'>('image/png');

  // Render canvas reference & preview
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // AI Modal
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get active requirements list
  const currentRequirements = platform === 'appStore' 
    ? reqState.appStore.requirements 
    : reqState.googlePlay.requirements;

  const activeSpec = currentRequirements.find(r => r.id === selectedSpecId) || currentRequirements[0];

  // Sync dimensions when selected spec changes
  const handleSpecSelect = (spec: ScreenshotRequirement) => {
    setSelectedSpecId(spec.id);
    setWidth(spec.width);
    setHeight(spec.height);
    if (spec.deviceCategory.includes('tablet')) {
      setFrameStyle('tablet');
    } else if (platform === 'appStore') {
      setFrameStyle('iphone-dynamic');
    } else {
      setFrameStyle('android-punch');
    }
  };

  // Switch platform
  const handlePlatformChange = (p: PlatformChoice) => {
    setPlatform(p);
    const newReqs = p === 'appStore' ? reqState.appStore.requirements : reqState.googlePlay.requirements;
    if (newReqs.length > 0) {
      handleSpecSelect(newReqs[0]);
    }
  };

  // Validation checking against store requirements
  const checkValidation = () => {
    const issues: string[] = [];
    if (platform === 'googlePlay') {
      if (width < 320 || height < 320) {
        issues.push('Google Play requires minimum dimension of 320px.');
      }
      if (width > 3840 || height > 3840) {
        issues.push('Google Play maximum dimension is 3,840px.');
      }
      const maxSide = Math.max(width, height);
      const minSide = Math.min(width, height);
      if (maxSide / minSide > 2.05) {
        issues.push('Google Play aspect ratio exceeds 2:1 limit. May be rejected by Play Console.');
      }
    } else {
      if (outputFormat === 'image/png') {
        // App store warns on alpha, handled via opaque canvas rendering
      }
    }
    return issues;
  };

  const validationIssues = checkValidation();

  // Generate initial app screenshot mockup placeholder
  useEffect(() => {
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 1170;
    demoCanvas.height = 2532;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      // Dark slate app background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1170, 2532);

      // App Header bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1170, 240);

      // Status bar time
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('9:41', 80, 140);

      // Header title
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText('Overview', 80, 360);

      // Metric card 1
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(80, 440, 1010, 340, 32);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('ACTIVE BUILD', 130, 520);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText('v2.4.0 Production', 130, 620);

      // Metric card 2
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(80, 830, 1010, 480, 32);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('NETWORK LATENCY', 130, 910);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText('12ms • Global Edge', 130, 1000);

      // Mock list items
      for (let i = 0; i < 4; i++) {
        const y = 1360 + i * 180;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(80, y, 1010, 140, 24);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText(`Asset Sync Bundle #${104 + i}`, 140, y + 82);
      }

      const url = demoCanvas.toDataURL('image/png');
      loadImage(url).then(img => {
        setScreenshotImg(img);
        setScreenshotDataUrl(url);
      });
    }
  }, []);

  // Main canvas compositing engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if (bgType === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (gradientPreset === 'obsidian') {
        grad.addColorStop(0, '#09090b');
        grad.addColorStop(0.5, '#18181b');
        grad.addColorStop(1, '#09090b');
      } else if (gradientPreset === 'indigo') {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#0f172a');
      } else if (gradientPreset === 'emerald') {
        grad.addColorStop(0, '#022c22');
        grad.addColorStop(0.5, '#064e3b');
        grad.addColorStop(1, '#022c22');
      } else if (gradientPreset === 'frost') {
        grad.addColorStop(0, '#f4f4f5');
        grad.addColorStop(0.5, '#e4e4e7');
        grad.addColorStop(1, '#f4f4f5');
      } else if (gradientPreset === 'sunset') {
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(0.5, '#451a03');
        grad.addColorStop(1, '#1c1917');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Typography Overlay
    const paddingX = Math.round(width * 0.08);
    const contentWidth = width - paddingX * 2;

    const isTopText = textPosition === 'top';
    const textStartY = isTopText ? Math.round(height * 0.08) : Math.round(height * 0.82);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = gradientPreset === 'frost' && textColor === '#ffffff' ? '#09090b' : textColor;

    // Title
    ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(titleText, width / 2, textStartY, contentWidth);

    // Subtitle
    if (subtitleText.trim()) {
      ctx.font = `500 ${Math.round(titleFontSize * 0.44)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
      ctx.globalAlpha = 0.8;
      ctx.fillText(subtitleText, width / 2, textStartY + titleFontSize * 0.7, contentWidth);
      ctx.globalAlpha = 1.0;
    }
    ctx.restore();

    // 3. Render Device Mockup & Screenshot
    if (screenshotImg) {
      const isLandscape = width > height;
      const deviceAspect = isLandscape ? 16 / 9 : 9 / 19.5;

      const baseDeviceWidth = isLandscape ? width * 0.75 : width * mockupScale;
      const deviceWidth = Math.round(baseDeviceWidth);
      const deviceHeight = Math.round(deviceWidth / deviceAspect);

      const deviceX = Math.round((width - deviceWidth) / 2);
      const deviceY = isTopText 
        ? Math.round(height * 0.22 + mockupOffsetY) 
        : Math.round(height * 0.06 + mockupOffsetY);

      ctx.save();

      // Hardware Device Frame Rendering
      if (frameStyle !== 'none') {
        // Drop Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 60;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 30;

        const cornerRadius = frameStyle === 'tablet' ? 24 : 54;
        const bezelWidth = frameStyle === 'tablet' ? 14 : 12;

        // Outer Bezel
        ctx.fillStyle = '#1c1c1e';
        ctx.beginPath();
        ctx.roundRect(deviceX, deviceY, deviceWidth, deviceHeight, cornerRadius);
        ctx.fill();

        // Subtle specular edge highlight
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        // Screen area clip
        const screenX = deviceX + bezelWidth;
        const screenY = deviceY + bezelWidth;
        const screenW = deviceWidth - bezelWidth * 2;
        const screenH = deviceHeight - bezelWidth * 2;
        const screenRadius = Math.max(0, cornerRadius - bezelWidth);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(screenX, screenY, screenW, screenH, screenRadius);
        ctx.clip();

        // Draw image inside screen
        ctx.drawImage(screenshotImg, screenX, screenY, screenW, screenH);

        // Hardware details: Dynamic Island or Punch Hole
        if (frameStyle === 'iphone-dynamic') {
          const islandW = Math.round(screenW * 0.28);
          const islandH = Math.round(screenH * 0.034);
          const islandX = screenX + Math.round((screenW - islandW) / 2);
          const islandY = screenY + Math.round(screenH * 0.015);

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.roundRect(islandX, islandY, islandW, islandH, islandH / 2);
          ctx.fill();
        } else if (frameStyle === 'android-punch') {
          const holeR = Math.round(screenH * 0.012);
          const holeX = screenX + Math.round(screenW / 2);
          const holeY = screenY + Math.round(screenH * 0.024);

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(holeX, holeY, holeR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      } else {
        // Frameless / Raw
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;
        ctx.beginPath();
        ctx.roundRect(deviceX, deviceY, deviceWidth, deviceHeight, 28);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(deviceX, deviceY, deviceWidth, deviceHeight, 28);
        ctx.clip();
        ctx.drawImage(screenshotImg, deviceX, deviceY, deviceWidth, deviceHeight);
        ctx.restore();
      }

      ctx.restore();
    }

    setPreviewDataUrl(canvas.toDataURL(outputFormat, 0.95));
    setIsRendering(false);
  }, [
    width,
    height,
    platform,
    screenshotImg,
    frameStyle,
    mockupScale,
    mockupOffsetY,
    bgType,
    gradientPreset,
    solidColor,
    titleText,
    subtitleText,
    textColor,
    textPosition,
    titleFontSize,
    outputFormat,
  ]);

  const handleUploadScreenshot = (file: File) => {
    loadImage(file).then(img => {
      setScreenshotImg(img);
      setScreenshotDataUrl(img.src);
    });
  };

  const handleDownloadSingle = () => {
    if (!previewDataUrl) return;
    const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
    const filename = `${platform}_screenshot_${width}x${height}.${ext}`;
    triggerDownload(previewDataUrl, filename);
  };

  const handleDownloadAllSizesZip = async () => {
    if (!previewDataUrl || !screenshotImg) return;
    setIsExportingZip(true);
    try {
      const items: Array<{ filename: string; blob: Blob }> = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      for (const spec of currentRequirements) {
        canvas.width = spec.width;
        canvas.height = spec.height;

        // Fill background
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, spec.width, spec.height);

        // Simple scale render
        ctx.drawImage(screenshotImg, 0, 0, spec.width, spec.height);

        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              items.push({
                filename: `${spec.id}_${spec.width}x${spec.height}.png`,
                blob
              });
            }
            resolve();
          }, 'image/png');
        });
      }

      await exportScreenshotsZip(items, `${platform}_screenshots_package`);
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Studio Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Platform Selector Segment */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => handlePlatformChange('appStore')}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                platform === 'appStore'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Apple App Store
            </button>
            <button
              onClick={() => handlePlatformChange('googlePlay')}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                platform === 'googlePlay'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Google Play Console
            </button>
          </div>

          {/* Compliance Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[11px] font-mono border border-zinc-200/60 dark:border-zinc-800/60">
            {validationIssues.length === 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Compliant ({width}×{height})</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">Spec Warning</span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Upload Screen</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUploadScreenshot(e.target.files[0])}
            className="hidden"
          />

          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">AI Mockup</span>
          </button>

          <button
            onClick={handleDownloadAllSizesZip}
            disabled={isExportingZip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
            title="Download ZIP for all required screen sizes"
          >
            <FolderArchive className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">{isExportingZip ? 'Packaging...' : 'Export ZIP'}</span>
          </button>

          <button
            onClick={handleDownloadSingle}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download High-Res</span>
          </button>

        </div>
      </div>

      {/* Validation Alert (if any) */}
      {validationIssues.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{validationIssues[0]}</span>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Preset Selector */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
              Official Preset Dimensions
            </span>

            <select
              value={selectedSpecId}
              onChange={(e) => {
                const spec = currentRequirements.find(r => r.id === e.target.value);
                if (spec) handleSpecSelect(spec);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium"
            >
              {currentRequirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.name} ({req.width} × {req.height})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-500 pt-1">
              <div>Aspect: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeSpec.aspectRatioDesc || `${activeSpec.width}:${activeSpec.height}`}</span></div>
              <div>Alpha: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{platform === 'googlePlay' ? 'Stripped' : 'No Alpha'}</span></div>
            </div>
          </div>

          {/* Hardware Device Mockup Frame */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
              Hardware Frame & Scale
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'iphone-dynamic', label: 'Dynamic Island' },
                { id: 'android-punch', label: 'Punch Hole' },
                { id: 'tablet', label: 'Tablet Frame' },
                { id: 'none', label: 'Frameless' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFrameStyle(item.id as any)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors ${
                    frameStyle === item.id
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Device Scale</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.round(mockupScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.01"
                value={mockupScale}
                onChange={(e) => setMockupScale(parseFloat(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-zinc-100 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Curated Studio Backdrops */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
              Studio Backdrop
            </span>

            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'obsidian', title: 'Obsidian Noir', color: 'bg-zinc-900' },
                { id: 'indigo', title: 'Deep Indigo', color: 'bg-indigo-950' },
                { id: 'emerald', title: 'Deep Pine', color: 'bg-emerald-950' },
                { id: 'sunset', title: 'Sunset Ember', color: 'bg-amber-950' },
                { id: 'frost', title: 'Nordic Frost', color: 'bg-zinc-200' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setBgType('gradient');
                    setGradientPreset(p.id);
                  }}
                  className={`h-7 rounded-lg ${p.color} border-2 transition-transform ${
                    gradientPreset === p.id ? 'border-emerald-500 scale-105' : 'border-transparent'
                  }`}
                  title={p.title}
                />
              ))}
            </div>
          </div>

          {/* Marketing Copy & Typography Overlay */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
              Header & Typography
            </span>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                maxLength={60}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                Subtitle Description
              </label>
              <input
                type="text"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                maxLength={90}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTextPosition(textPosition === 'top' ? 'bottom' : 'top')}
                  className="px-2.5 py-1 text-[11px] font-mono rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  Position: {textPosition.toUpperCase()}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-400">Size</span>
                <NumericInput
                  min={12}
                  max={160}
                  fallbackValue={64}
                  value={titleFontSize}
                  onChange={(val) => setTitleFontSize(val)}
                  className="w-14 px-1.5 py-1 text-xs font-mono text-center rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Center Stage / Viewport (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          
          <div className="relative w-full h-[620px] rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-6 bg-studio-dots shadow-inner">
            
            {/* Zoom Controls HUD */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.1))}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1.5 text-zinc-700 dark:text-zinc-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.1))}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ml-0.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hidden Engine Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Rendered Live Preview */}
            <div 
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.1s ease-out' }}
              className="relative max-w-full max-h-full flex items-center justify-center"
            >
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Screenshot Preview"
                  className="max-h-[520px] object-contain shadow-2xl rounded-sm border border-zinc-300 dark:border-zinc-800"
                />
              ) : (
                <div className="text-center text-xs text-zinc-400 font-mono">
                  Rendering store mockup canvas...
                </div>
              )}
            </div>

            {/* Bottom Status HUD */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Target: {width} × {height} px ({activeSpec.aspectRatioDesc || `${width}:${height}`})</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center text-[11px] text-zinc-500">
            Exported screenshots comply with Apple App Store Connect and Google Play Console resolution limits.
          </div>

        </div>

      </div>

      {/* AI Modal */}
      {showAiModal && (
        <AiImageGeneratorModal
          currentImg={screenshotDataUrl}
          onApplyImage={(url) => {
            loadImage(url).then(img => {
              setScreenshotImg(img);
              setScreenshotDataUrl(url);
              setShowAiModal(false);
            });
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}

    </div>
  );
};
