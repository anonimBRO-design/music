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

  return (
    <div className={`neu-app-shell relative h-screen w-screen flex overflow-hidden font-syne antialiased selection:bg-iosBlue selection:text-white transition-colors duration-500 ${
      theme === 'light' ? 'text-zinc-900' : 'text-white'
    }`}>

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
              className={`relative flex flex-col items-center justify-center gap-0.5 w-12 h-11 rounded-xl transition-all ios-btn-spring cursor-pointer ${
                active ? 'text-iosEmerald font-bold scale-105 bg-white/10 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? 'scale-110 text-iosEmerald' : ''}`} />
              <span className="text-[9px] tracking-tight">{item.label}</span>
              {active && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-iosEmerald shadow-[0_0_8px_rgba(48,209,88,0.8)]" />
              )}
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
