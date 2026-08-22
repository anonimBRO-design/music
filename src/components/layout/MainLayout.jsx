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

  const isEqOpen = useEqualizerStore((s) => s.isOpen);
  const setEqOpen = useEqualizerStore((s) => s.setOpen);

  // Global keyboard shortcuts
  useKeyboardShortcuts();

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
    <div className="relative h-screen w-screen bg-iosBg text-white flex overflow-hidden font-syne antialiased selection:bg-iosBlue selection:text-white">
      {/* iOS 27 Spatial Ambient Lighting Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-iosBlue/15 to-iosPurple/10 rounded-full blur-[120px] animate-float-ambient" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-iosEmerald/10 to-iosIndigo/15 rounded-full blur-[140px] animate-float-ambient" style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-gradient-to-t from-iosPink/10 to-transparent rounded-full blur-[130px] animate-float-ambient" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hidden Persistent Audio Engine */}
      <AudioEngine />

      {/* Left Sidebar */}
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
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Sticky Topbar */}
        <Topbar
          onNavigateSearch={onNavigateSearch}
          onNavigateProfile={() => onSelectTab('profile')}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto pb-36">
          {children}
        </main>
      </div>

      {/* Bottom Floating Island Player Bar */}
      <PlayerBar />

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
