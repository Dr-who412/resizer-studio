import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Crop, 
  Smartphone, 
  Layers, 
  BookOpen, 
  Heart, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Command,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '../../config/firebase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Sign-in message:', err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: 'image-editor', label: 'Image Resizer', shortcut: '1', icon: Crop },
    { id: 'store-screenshots', label: 'Store Mockups', shortcut: '2', icon: Smartphone },
    { id: 'app-icons', label: 'Icon Generator', shortcut: '3', icon: Layers },
    { id: 'requirements', label: 'Store Specs', shortcut: '4', icon: BookOpen },
    { id: 'support', label: 'Community', shortcut: '5', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('image-editor')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            id="navbar-brand"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-95">
              <span className="font-mono text-xs font-black tracking-tight">RS</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Resizer Studio
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Client-Side Engine Active" />
              </div>
              <span className="hidden sm:block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Image Resizer & Asset Toolkit
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tactile Segmented Tool Switcher */}
        <nav className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900/90 p-0.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
                <kbd className={`hidden xl:inline-block font-mono text-[9px] px-1 py-0.2 rounded border ${
                  isActive 
                    ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400' 
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                }`}>
                  {item.shortcut}
                </kbd>
              </button>
            );
          })}
        </nav>

        {/* Right Utilities: Engine Pill, Dark mode & Google Auth */}
        <div className="flex items-center gap-2">
          
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[11px] font-mono border border-zinc-200/60 dark:border-zinc-800/60">
            <Cpu className="w-3 h-3 text-emerald-500" />
            <span>Browser Engine</span>
          </div>

          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-zinc-200 dark:border-zinc-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-[10px]">
                  {user.displayName?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
                </div>
              )}
              <button
                id="sign-out-btn"
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={authLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-colors shadow-xs"
            >
              <LogIn className="w-3 h-3" />
              <span>{authLoading ? 'Signing in...' : 'Sign in'}</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-1">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'home' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
