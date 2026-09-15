import React from 'react';
import { ExternalLink, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Philosophy */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
              <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-mono text-[10px] font-bold">
                AS
              </div>
              <span className="text-[13px] tracking-tight">App Asset Studio</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Precision developer toolkit for mobile engineers and designers. Formatted for Apple App Store Connect and Google Play Console.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>100% Client-Side Engine</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-2.5">
              Tools
            </h3>
            <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li>
                <button onClick={() => onNavigate('image-editor')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Image Resize & Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('store-screenshots')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Store Screenshot Mockups
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('app-icons')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  iOS & Android Icon Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('requirements')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Store Specifications Matrix
                </button>
              </li>
            </ul>
          </div>

          {/* Official Store Documentation */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-2.5">
              Official Guidelines
            </h3>
            <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li>
                <a 
                  href="https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
                >
                  <span>App Store Screenshot Specs</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://support.google.com/googleplay/android-developer/answer/9866180" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Google Play Preview Assets</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Android Adaptive Icons</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://developer.apple.com/design/human-interface-guidelines/app-icons" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Apple HIG App Icons</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Support */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-2.5">
              Privacy & Project
            </h3>
            <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span>Privacy Policy (No Cloud Uploads)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('support')} className="hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>Community Suggestions</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  About Architecture
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} App Asset Studio. Free, client-side developer utility.</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Apple, App Store, and iPhone are trademarks of Apple Inc. Google Play and Android are trademarks of Google LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};
