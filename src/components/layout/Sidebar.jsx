import React from 'react';
import { usePlaylistStore } from '../../stores/usePlaylistStore';
import {
  Home,
  Search,
  Heart,
  Clock,
  Library,
  Radio,
  Sparkles,
  Shield,
  Plus,
  Settings,
  Music,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import logoBanner from '../../assets/logo.png';
import logoIcon from '../../assets/icon-192.png';

export const Sidebar = ({ activeTab, onSelectTab, isCollapsed, setIsCollapsed, onOpenSettings }) => {
  const playlists = usePlaylistStore((s) => s.playlists);
  const openCreateModal = usePlaylistStore((s) => s.openCreateModal);

  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'liked', label: 'Liked Songs', icon: Heart, badgeColor: 'text-pink-400' },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  const socialNav = [
    { id: 'party', label: 'Listening Party', icon: Radio, highlight: true },
    { id: 'wrapped', label: 'Wrapped 2026', icon: Sparkles, color: 'text-emerald-400' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-dawSurface border-r border-dawBorder z-30 hidden md:flex flex-col transition-all duration-200 select-none font-mono ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div
        onClick={() => onSelectTab('home')}
        className="h-13 flex items-center px-4 border-b border-dawBorder cursor-pointer hover:bg-dawHover/60 transition-colors"
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-dawAmber text-black flex items-center justify-center font-bold text-xs shadow">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-white">NONIMSONG</span>
              <span className="text-[9px] text-dawAmber tracking-widest uppercase">STUDIO PRO</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-7 h-7 rounded bg-dawAmber text-black flex items-center justify-center font-bold text-xs shadow">
            N
          </div>
        )}
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin scrollbar-thumb-dawBorder scrollbar-track-transparent">
        {/* Main Explorer */}
        <div className="space-y-0.5">
          <div className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-dawMuted ${isCollapsed ? 'hidden' : 'block'}`}>
            Explorer
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer relative ${
                  active
                    ? 'bg-dawPanel text-dawGreen border border-dawBorderBright font-bold'
                    : 'text-dawMuted hover:text-white hover:bg-dawHover/60'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                {active && !isCollapsed && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-dawGreen rounded-r" />
                )}
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-dawGreen' : ''}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Modules / Social */}
        <div className="space-y-0.5">
          <div className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-dawMuted ${isCollapsed ? 'hidden' : 'block'}`}>
            Features
          </div>
          {socialNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer relative ${
                  active
                    ? 'bg-dawPanel text-dawAmber border border-dawBorderBright font-bold'
                    : 'text-dawMuted hover:text-white hover:bg-dawHover/60'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                {active && !isCollapsed && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-dawAmber rounded-r" />
                )}
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-dawAmber' : ''}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User Playlists */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-dawBorder space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-dawMuted">
                Playlists ({playlists.length})
              </span>
              <button
                onClick={openCreateModal}
                className="text-dawMuted hover:text-white p-0.5 rounded hover:bg-dawHover transition-colors cursor-pointer"
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
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors group cursor-pointer ${
                      active
                        ? 'bg-dawPanel text-dawCyan border border-dawBorderBright font-bold'
                        : 'text-dawMuted hover:text-white hover:bg-dawHover/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Music className={`w-3 h-3 shrink-0 ${active ? 'text-dawCyan' : 'text-dawMuted'}`} />
                      <span className="truncate text-[11px]">{pl.name}</span>
                    </div>
                    <span className="text-[10px] text-dawMuted/60 font-mono group-hover:text-dawMuted">
                      {pl.tracks?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / System */}
      <div className="p-2 border-t border-dawBorder flex items-center justify-between gap-1 bg-dawSurface shrink-0">
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 p-1.5 rounded text-xs text-dawMuted hover:text-white hover:bg-dawHover transition-colors cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span className="text-[11px]">Settings</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-dawMuted hover:text-white p-1.5 rounded hover:bg-dawHover transition-colors hidden md:block cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
