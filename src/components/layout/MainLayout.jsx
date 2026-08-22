import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PlayerBar } from '../player/PlayerBar';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { AudioEngine } from '../player/AudioEngine';
import { QueuePanel } from '../queue/QueuePanel';
import { PlaylistEditModal } from '../modals/PlaylistEditModal';
import { PlaylistPickerModal } from '../modals/PlaylistPickerModal';
import { SettingsModal } from '../modals/SettingsModal';
import { SleepTimerModal } from '../modals/SleepTimerModal';
import { EqualizerModal } from '../modals/EqualizerModal';
import { ContextMenu } from '../ui/ContextMenu';
import { ToastContainer } from '../ui/ToastContainer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useEqualizerStore } from '../../stores/useEqualizerStore';
import { useUserStore } from '../../stores/useUserStore';
import { Home, Search, Heart, Library, Settings as SettingsIcon } from 'lucide-react';

export const MainLayout = ({
  activeTab,
  onSelectTab,
  onNavigateSearch,
  children,
  contextMenuState,
  onCloseContextMenu
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);

  const theme = useUserStore((s) => s.theme);
  const isEqOpen = useEqualizerStore((s) => s.isOpen);
  const setEqOpen = useEqualizerStore((s) => s.setOpen);

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  // Auto-collapse sidebar on tablet screens (768px - 1023px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for custom events from PlayerBar buttons
  useEffect(() => {
    const handleOpenSleepTimer = () => setIsSleepTimerOpen(true);
    const handleOpenEqualizer = () => setEqOpen(true);

    window.addEventListener('nonimsong:open-sleep-timer', handleOpenSleepTimer);
    window.addEventListener('nonimsong:open-equalizer', handleOpenEqualizer);

    return () => {
      window.removeEventListener('nonimsong:open-sleep-timer', handleOpenSleepTimer);
      window.removeEventListener('nonimsong:open-equalizer', handleOpenEqualizer);
    };
  }, []);

  const isLight = theme === 'light-liquid' || theme === 'light';
  const isDarkLiquid = theme === 'dark-liquid';
  const isNormal = theme === 'normal';

  const desktopBg = isDarkLiquid
    ? "url('/wallpapers/liquid-dark.png')"
    : isLight
    ? "url('/wallpapers/liquid-light.png')"
    : 'none';

  const mobileBg = isDarkLiquid
    ? "url('/wallpapers/liquid-dark-mobile.png')"
    : isLight
    ? "url('/wallpapers/liquid-light-mobile.png')"
    : 'none';

  return (
    <div className={`relative h-screen w-screen flex overflow-hidden font-syne antialiased selection:bg-iosBlue selection:text-white transition-colors duration-500 ${
      isLight ? 'bg-[#f5effc] text-zinc-900' : isDarkLiquid ? 'bg-[#07010f] text-white' : 'bg-iosBg text-white'
    }`}>
      {/* Dynamic Theme Wallpaper Background (Desktop Landscape) */}
      {!isNormal && (
        <>
          <div
            className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-90 hidden sm:block"
            style={{ backgroundImage: desktopBg }}
          />
          {/* Dynamic Theme Wallpaper Background (Mobile Portrait) */}
          <div
            className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-95 sm:hidden"
            style={{ backgroundImage: mobileBg }}
          />
        </>
      )}

      {/* Subtle Spatial Tint Overlay */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
        isLight ? 'bg-white/10' : isDarkLiquid ? 'bg-black/25' : 'bg-black/40'
      }`} />

      {/* iOS 27 Spatial Ambient Lighting Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] animate-float-ambient ${
          isDarkLiquid ? 'bg-gradient-to-tr from-purple-600/25 to-indigo-600/20' : 'bg-gradient-to-tr from-iosBlue/15 to-iosPurple/10'
        }`} />
        <div className={`absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] animate-float-ambient ${
          isDarkLiquid ? 'bg-gradient-to-bl from-fuchsia-600/20 to-purple-800/25' : 'bg-gradient-to-bl from-iosEmerald/10 to-iosIndigo/15'
        }`} style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-gradient-to-t from-iosPink/10 to-transparent rounded-full blur-[130px] animate-float-ambient" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hidden Persistent Audio Engine */}
      <AudioEngine />

      {/* Left Sidebar (Desktop / Tablet only) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <div
        className={`relative z-10 flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-0 md:pl-20' : 'pl-0 md:pl-64'
        }`}
      >
        {/* Sticky Topbar */}
        <Topbar
          activeTab={activeTab}
          onNavigateSearch={onNavigateSearch}
          onNavigateProfile={() => onSelectTab('profile')}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto pb-44 md:pb-32">
          {children}
        </main>
      </div>

      {/* Bottom Floating Island Player Bar */}
      <PlayerBar isSidebarCollapsed={isSidebarCollapsed} />

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-2.5 left-3 right-3 h-14 ios-glass-dock rounded-[22px] z-50 md:hidden flex items-center justify-around px-2 shadow-2xl">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'liked', label: 'Liked', icon: Heart },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, isSettings: true }
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isSettings) setIsSettingsOpen(true);
                else onSelectTab(item.id);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 w-12 h-11 rounded-xl transition-all ios-btn-spring cursor-pointer ${
                active ? 'text-iosEmerald font-bold scale-105' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-iosEmerald' : ''}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Slideout Queue Panel */}
      <QueuePanel />

      {/* Fullscreen Overlay Player */}
      <FullscreenPlayer />

      {/* Global Modals */}
      <PlaylistEditModal />
      <PlaylistPickerModal />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenSleepTimer={() => {
          setIsSettingsOpen(false);
          setIsSleepTimerOpen(true);
        }}
        onOpenEqualizer={() => {
          setIsSettingsOpen(false);
          setEqOpen(true);
        }}
      />
      <SleepTimerModal isOpen={isSleepTimerOpen} onClose={() => setIsSleepTimerOpen(false)} />
      <EqualizerModal isOpen={isEqOpen} onClose={() => setEqOpen(false)} />

      {/* Context Menu & Notifications */}
      <ContextMenu state={contextMenuState} onClose={onCloseContextMenu} />
      <ToastContainer />
    </div>
  );
};
