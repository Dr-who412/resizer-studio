import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

export const PrivacyAndAboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono border border-zinc-200 dark:border-zinc-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Engine Privacy Guarantee</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Privacy Policy & Architecture
        </h1>
        <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
          App Asset Studio processes your visual assets client-side in the browser. Your unpublished app screens and vector marks never upload to external servers.
        </p>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
            Local Browser Processing
          </h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            All image resizing, cropping, transparency stripping, and icon generation execute locally inside your browser via the HTML5 2D Canvas engine.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
            No Image Tracking
          </h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            We do not store, catalog, watermark, or save your source mockups or master icons. When you close or refresh your browser tab, memory is cleared.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
            Secure AI Integration
          </h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            When you invoke the Gemini AI generation tool, prompt requests are handled transiently via encrypted server-side proxying without persistent disk retention.
          </p>
        </div>
      </div>

      {/* Detailed FAQs and Disclaimers */}
      <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-5 text-xs text-zinc-600 dark:text-zinc-400">
        
        <div>
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mb-1.5">
            Are there any usage quotas or hidden subscriptions?
          </h4>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            No. App Asset Studio is free to use for hobbyists, independent solo makers, design agencies, and enterprise development teams.
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mb-1.5">
            Trademark & Legal Attribution
          </h4>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Apple, App Store, iPhone, iPad, Mac, and Xcode are registered trademarks of Apple Inc. Google, Google Play, and Android are registered trademarks of Google LLC. App Asset Studio is an independent utility created to assist developers and is not affiliated with, sponsored by, or endorsed by Apple Inc. or Google LLC.
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mb-1.5">
            Advertising & Monetization Transparency
          </h4>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            App Asset Studio is funded solely through non-intrusive banner advertisements and voluntary community sponsorships. We never use popups, overlays, full-screen interstitial traps, or forced redirects.
          </p>
        </div>

      </div>

    </div>
  );
};
