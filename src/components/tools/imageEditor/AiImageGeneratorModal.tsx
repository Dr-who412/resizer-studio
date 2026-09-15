import React, { useState } from 'react';
import { Sparkles, Wand2, X, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { generateImageWithAi, editImageWithAi } from '../../../services/geminiClient';

interface AiImageGeneratorModalProps {
  currentImageDataUrl?: string | null;
  currentImg?: string | null;
  onImageGenerated?: (imageUrl: string) => void;
  onApplyImage?: (imageUrl: string) => void;
  onClose: () => void;
}

export const AiImageGeneratorModal: React.FC<AiImageGeneratorModalProps> = ({
  currentImageDataUrl,
  currentImg,
  onImageGenerated,
  onApplyImage,
  onClose,
}) => {
  const activeImg = currentImageDataUrl ?? currentImg ?? null;
  const [mode, setMode] = useState<'generate' | 'edit'>(activeImg ? 'edit' : 'generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const samplePrompts = mode === 'generate' ? [
    'A minimalist geometric iOS app icon of a flying origami crane, emerald and slate on pure dark background, high resolution 3D render',
    'Modern abstract gradient background for mobile app screenshots, deep indigo and violet with subtle mesh curves',
    'Vibrant fintech app icon with golden credit card and digital shield, Apple HIG aesthetics, clean lighting',
    'Health and fitness mobile app icon featuring a glowing heart pulse line, sleek modern dark mode design'
  ] : [
    'Add a clean dark gradient background and subtle drop shadow',
    'Enhance the lighting and add a modern glassmorphic sheen',
    'Convert the colors to an elegant emerald and midnight slate palette',
    'Sharpen lines and add sleek metallic edge highlights'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'generate') {
        const imageUrl = await generateImageWithAi({
          prompt,
          aspectRatio,
          imageSize: '1K'
        });
        setPreviewResult(imageUrl);
      } else {
        if (!activeImg) {
          throw new Error('No base image loaded to edit.');
        }
        const imageUrl = await editImageWithAi({
          prompt,
          base64Image: activeImg,
          mimeType: 'image/png'
        });
        setPreviewResult(imageUrl);
      }
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      setError(err.message || 'Failed to generate image. Please try another prompt.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (previewResult) {
      if (onImageGenerated) onImageGenerated(previewResult);
      if (onApplyImage) onApplyImage(previewResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Image Creator & Editor
              </h3>
              <p className="text-xs text-slate-500">
                Powered by Gemini 3.1 Flash Image model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => { setMode('generate'); setPreviewResult(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'generate'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Generate New Image
            </button>
            <button
              type="button"
              disabled={!currentImageDataUrl}
              onClick={() => { setMode('edit'); setPreviewResult(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : currentImageDataUrl 
                    ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900' 
                    : 'opacity-40 cursor-not-allowed'
              }`}
            >
              Edit Current Image {currentImageDataUrl ? '' : '(Upload image first)'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {mode === 'generate' ? 'Describe the image or icon you need' : 'Describe the edits or style modifications'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'generate' ? 'e.g. Modern flat finance app icon with a stylized leaf in a rounded square...' : 'e.g. Add a dark gradient background and make the icon 3D with realistic lighting...'}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Prompt suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Sample Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-left text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    "{p.substring(0, 42)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio options for generate mode */}
            {mode === 'generate' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="flex gap-2">
                  {(['1:1', '9:16', '16:9', '4:3', '3:4'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        aspectRatio === r
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {r} {r === '1:1' ? '(Icon)' : r === '9:16' ? '(Phone)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{mode === 'generate' ? 'Generate Image with AI' : 'Apply AI Edits'}</span>
                </>
              )}
            </button>
          </form>

          {/* Result Preview */}
          {previewResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  AI Generated Result:
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Ready to import
                </span>
              </div>
              <div className="flex justify-center bg-slate-200 dark:bg-slate-900 rounded-lg p-2 max-h-60 overflow-hidden">
                <img
                  src={previewResult}
                  alt="AI output"
                  className="max-h-56 object-contain rounded-md shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Use This Image in Editor</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
