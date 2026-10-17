import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { StudioInspector } from './StudioInspector';
import { PlayerBar } from '../player/PlayerBar';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { AudioEngine } from '../player/AudioEngine';
import { QueuePanel } from '../queue/QueuePanel';
import { PlaylistEditModal } from '../modals/PlaylistEditModal';
import { PlaylistPickerModal } from '../modals/PlaylistPickerModal';
import { SettingsModal } from '../modals/SettingsModal';
import { SleepTimerModal } from '../modals/SleepTimerModal';
import { EqualizerModal } from '../modals/EqualizerModal';
import { SpotifyImportModal } from '../modals/SpotifyImportModal';
import { CommandPaletteModal } from '../modals/CommandPaletteModal';
import { ShortcutHelpModal } from '../modals/ShortcutHelpModal';
import { MiniPlayer } from '../player/MiniPlayer';
import { ContextMenu } from '../ui/ContextMenu';
import { ToastContainer } from '../ui/ToastContainer';
import { ErrorBoundary } from '../ui/ErrorBoundary';
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
    <div className="dot-grid-bg relative h-screen w-screen flex overflow-hidden font-sans text-text-main antialiased selection:bg-primary/30 selection:text-primary transition-colors duration-300">

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
        className={`relative z-10 flex-1 flex flex-col h-screen overflow-hidden transition-all duration-200 ${
          isSidebarCollapsed ? 'pl-0 md:pl-16' : 'pl-0 md:pl-60'
        }`}
      >
        {/* Sticky Topbar */}
        <Topbar
          activeTab={activeTab}
          onNavigateSearch={onNavigateSearch}
          onNavigateProfile={() => onSelectTab('profile')}
        />

        {/* 3-Column Studio Workspace (Center Main + Right Inspector) */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-44 md:pb-28">
            {children}
          </main>
          <StudioInspector />
        </div>
      </div>

      {/* Bottom Floating Island Player Bar */}
      <PlayerBar isSidebarCollapsed={isSidebarCollapsed} />

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-2.5 left-3 right-3 h-14 bg-sidebar/90 backdrop-blur-2xl border border-border rounded-2xl z-50 md:hidden flex items-center justify-around px-2 shadow-elevated">
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
              className={`relative flex flex-col items-center justify-center gap-0.5 w-12 h-11 rounded-xl transition-all cursor-pointer ${
                active ? 'text-primary font-bold scale-105 bg-primary/10 shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? 'scale-110 text-primary' : ''}`} />
              <span className="text-[9px] tracking-tight">{item.label}</span>
              {active && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Slideout Queue Panel */}
      <QueuePanel />

      {/* Fullscreen Overlay Player */}
      <ErrorBoundary>
        <FullscreenPlayer />
      </ErrorBoundary>

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
      <SpotifyImportModal />

      {/* Pro DAW Overlays */}
      <MiniPlayer />
      <CommandPaletteModal onSelectTab={onSelectTab} onNavigateSearch={onNavigateSearch} />
      <ShortcutHelpModal />

      {/* Context Menu & Notifications */}
      <ContextMenu state={contextMenuState} onClose={onCloseContextMenu} />
      <ToastContainer />
    </div>
  );
};
