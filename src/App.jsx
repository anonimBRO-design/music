import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { LikedPage } from './pages/LikedPage';
import { HistoryPage } from './pages/HistoryPage';
import { LibraryPage } from './pages/LibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { PartyPage } from './pages/PartyPage';
import { WrappedPage } from './pages/WrappedPage';
import { AdminPage } from './pages/AdminPage';

import { ErrorBoundary } from './components/ui/ErrorBoundary';

export function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const [contextMenuState, setContextMenuState] = useState({
    visible: false,
    x: 0,
    y: 0,
    track: null,
    playlistId: null
  });

  const handleOpenContextMenu = (e, track, playlistId = null) => {
    e.preventDefault();
    setContextMenuState({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      track,
      playlistId
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenuState((prev) => ({ ...prev, visible: false }));
  };

  const handleNavigateSearch = (query) => {
    setSearchQuery(query);
    setCurrentTab('search');
  };

  const renderActiveView = () => {
    if (currentTab === 'home') {
      return (
        <HomePage
          onNavigateSearch={handleNavigateSearch}
          onOpenContextMenu={handleOpenContextMenu}
        />
      );
    }
    if (currentTab === 'search') {
      return (
        <SearchPage
          initialQuery={searchQuery}
          onOpenContextMenu={handleOpenContextMenu}
        />
      );
    }
    if (currentTab === 'liked') {
      return <LikedPage onOpenContextMenu={handleOpenContextMenu} />;
    }
    if (currentTab === 'history') {
      return <HistoryPage onOpenContextMenu={handleOpenContextMenu} />;
    }
    if (currentTab === 'library') {
      return <LibraryPage onSelectPlaylist={(id) => setCurrentTab(`playlist:${id}`)} />;
    }
    if (currentTab.startsWith('playlist:')) {
      const playlistId = currentTab.replace('playlist:', '');
      return (
        <PlaylistPage
          playlistId={playlistId}
          onNavigateLibrary={() => setCurrentTab('library')}
          onOpenContextMenu={handleOpenContextMenu}
        />
      );
    }
    if (currentTab === 'profile') {
      return <ProfilePage />;
    }
    if (currentTab === 'party') {
      return <PartyPage />;
    }
    if (currentTab === 'wrapped') {
      return <WrappedPage onExit={() => setCurrentTab('home')} />;
    }
    if (currentTab === 'admin') {
      return <AdminPage />;
    }
    return <HomePage onNavigateSearch={handleNavigateSearch} onOpenContextMenu={handleOpenContextMenu} />;
  };

  return (
    <MainLayout
      activeTab={currentTab}
      onSelectTab={setCurrentTab}
      onNavigateSearch={handleNavigateSearch}
      contextMenuState={contextMenuState}
      onCloseContextMenu={handleCloseContextMenu}
    >
      <ErrorBoundary>
        <div key={currentTab} className="animate-tab-enter min-h-full w-full">
          {renderActiveView()}
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
}

export default App;
