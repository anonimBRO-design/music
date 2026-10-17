import React from 'react';
import { usePlaylistStore } from '../../stores/usePlaylistStore';
import {
  Home,
  Search,
  Heart,
  Clock,
  Library,
  Plus,
  Settings,
  Music,
  ChevronLeft,
  ChevronRight,
  Headphones
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, isCollapsed, setIsCollapsed, onOpenSettings }) => {
  const playlists = usePlaylistStore((s) => s.playlists);
  const openCreateModal = usePlaylistStore((s) => s.openCreateModal);

  const mainNav = [
    { id: 'home', label: 'Home Stage', icon: Home },
    { id: 'search', label: 'Search & Explore', icon: Search },
    { id: 'liked', label: 'Liked Tracks', icon: Heart },
    { id: 'history', label: 'Session History', icon: Clock },
    { id: 'library', label: 'Audio Library', icon: Library },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-sidebar backdrop-blur-2xl border-r border-border z-30 hidden md:flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* 9Router macOS Traffic Lights */}
      <div className={`flex items-center gap-2 px-5 pt-4 pb-1 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="traffic-light red" />
        <div className="traffic-light yellow" />
        <div className="traffic-light green" />
      </div>

      {/* 9Router Logo & Brand Box */}
      <div
        onClick={() => onSelectTab('home')}
        className={`px-4 py-3 flex items-center gap-3 cursor-pointer group ${
          isCollapsed ? 'justify-center px-0' : ''
        }`}
      >
        <div className="flex items-center justify-center size-9 rounded-[10px] bg-gradient-to-br from-brand-500 to-brand-700 shadow-[var(--shadow-warm)] shrink-0 transition-transform group-hover:scale-105">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-text-main leading-tight truncate">
              NONIMSONG
            </h1>
            <span className="text-[10px] font-mono text-text-muted">v2.4 • PRO STUDIO</span>
          </div>
        )}
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {/* Main Explorer Navigation */}
        <div className="space-y-1">
          <div className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted/60 ${isCollapsed ? 'hidden' : 'block'}`}>
            Explorer
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer group ${
                  active
                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-[var(--shadow-warm)] font-semibold'
                    : 'text-text-muted hover:bg-surface-2 hover:text-text-main border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-primary' : 'group-hover:text-primary'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User Playlists */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-border-subtle space-y-1">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/60">
                Playlists ({playlists.length})
              </span>
              <button
                onClick={openCreateModal}
                className="text-text-muted hover:text-text-main p-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
                title="Create Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {playlists.map((pl) => {
                const active = activeTab === `playlist:${pl.id}`;
                return (
                  <button
                    key={pl.id}
                    onClick={() => onSelectTab(`playlist:${pl.id}`)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all group cursor-pointer ${
                      active
                        ? 'bg-primary/15 text-primary border border-primary/25 shadow-[var(--shadow-warm)] font-semibold'
                        : 'text-text-muted hover:bg-surface-2 hover:text-text-main border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Music className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-primary' : 'text-text-subtle'}`} />
                      <span className="truncate text-xs">{pl.name}</span>
                    </div>
                    <span className="text-[10px] text-text-subtle font-mono group-hover:text-text-muted">
                      {pl.tracks?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / System Controls */}
      <div className="p-3 border-t border-border flex items-center justify-between gap-1 bg-surface-2 shrink-0">
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-main hover:bg-surface-3 transition-colors cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium">Settings</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-surface-3 transition-colors hidden md:block cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
