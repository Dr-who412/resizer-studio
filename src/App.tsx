/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { OverviewPage } from './components/pages/OverviewPage';
import { ImageEditorTool } from './components/tools/imageEditor/ImageEditorTool';
import { ScreenshotGeneratorTool } from './components/tools/screenshotGenerator/ScreenshotGeneratorTool';
import { AppIconGeneratorTool } from './components/tools/iconGenerator/AppIconGeneratorTool';
import { RequirementsPage } from './components/pages/RequirementsPage';
import { SupportAndCommunityPage } from './components/pages/SupportAndCommunityPage';
import { PrivacyAndAboutPage } from './components/pages/PrivacyAndAboutPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('image-editor');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from system preference or local storage
  useEffect(() => {
    try {
      const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    } catch {
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      } catch {
        // Fallback if localStorage is restricted
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  };

  // Sync window hash for deep linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['image-editor', 'store-screenshots', 'app-icons', 'requirements', 'support', 'privacy', 'about'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1') handleNavigate('image-editor');
      if (e.key === '2') handleNavigate('store-screenshots');
      if (e.key === '3') handleNavigate('app-icons');
      if (e.key === '4') handleNavigate('requirements');
      if (e.key === '5') handleNavigate('support');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans transition-colors duration-200">
      
      {/* Main Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {activeTab === 'home' && (
          <OverviewPage onSelectTool={handleNavigate} />
        )}

        {activeTab === 'image-editor' && (
          <ImageEditorTool />
        )}

        {activeTab === 'store-screenshots' && (
          <ScreenshotGeneratorTool />
        )}

        {activeTab === 'app-icons' && (
          <AppIconGeneratorTool />
        )}

        {activeTab === 'requirements' && (
          <RequirementsPage />
        )}

        {activeTab === 'support' && (
          <SupportAndCommunityPage />
        )}

        {(activeTab === 'privacy' || activeTab === 'about') && (
          <PrivacyAndAboutPage />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
