import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PlayerBar } from '../player/PlayerBar';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { AudioEngine } from '../player/AudioEngine';
import { QueuePanel } from '../queue/QueuePanel';
import { PlaylistEditModal } from '../modals/PlaylistEditModal';
import { PlaylistPickerModal } from '../modals/PlaylistPickerModal';
import { SettingsModal } from '../modals/SettingsModal';
import { ContextMenu } from '../ui/ContextMenu';
import { ToastContainer } from '../ui/ToastContainer';

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

  return (
    <div className="h-screen w-screen bg-zinc-950 text-white flex overflow-hidden font-syne antialiased selection:bg-emerald-500 selection:text-black">
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
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Sticky Topbar */}
        <Topbar
          onNavigateSearch={onNavigateSearch}
          onNavigateProfile={() => onSelectTab('profile')}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto pb-32">
          {children}
        </main>
      </div>

      {/* Bottom Sticky Player Bar */}
      <PlayerBar />

      {/* Slideout Queue Panel */}
      <QueuePanel />

      {/* Fullscreen Overlay Player */}
      <FullscreenPlayer />

      {/* Global Modals */}
      <PlaylistEditModal />
      <PlaylistPickerModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Context Menu & Notifications */}
      <ContextMenu state={contextMenuState} onClose={onCloseContextMenu} />
      <ToastContainer />
    </div>
  );
};
