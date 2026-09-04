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
      className={`fixed top-0 left-0 bottom-0 ios-glass-panel z-30 hidden md:flex flex-col transition-all duration-300 select-none font-syne ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo */}
      <div
        onClick={() => onSelectTab('home')}
        className="flex items-center p-4 px-5 border-b border-white/[0.08] cursor-pointer hover:opacity-90 transition-opacity"
      >
        {!isCollapsed ? (
          <img
            src={logoBanner}
            alt="NONIMSONG"
            className="h-8 max-w-[170px] object-contain drop-shadow-[0_2px_12px_rgba(10,132,255,0.25)]"
          />
        ) : (
          <div className="mx-auto">
            <img
              src={logoIcon}
              alt="NONIMSONG"
              className="w-9 h-9 rounded-2xl object-contain shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Links */}
        <div className="space-y-1.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ios-btn-spring cursor-pointer relative overflow-hidden ${
                  active
                    ? 'bg-white/10 text-iosEmerald shadow-sm border border-white/10 tab-active-glow pl-4'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${active ? 'scale-110 text-iosEmerald' : ''}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Features Links */}
        <div className="space-y-1.5">
          {socialNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ios-btn-spring cursor-pointer relative overflow-hidden ${
                  active
                    ? 'bg-white/10 text-iosEmerald shadow-sm border border-white/10 tab-active-glow pl-4'
                    : item.color || 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User Playlists */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between px-3.5 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Playlists
              </span>
              <button
                onClick={openCreateModal}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 ios-btn-icon ios-btn-spring transition-colors cursor-pointer"
                title="Create Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => onSelectTab(`playlist:${pl.id}`)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition-all truncate group ios-btn-spring cursor-pointer relative overflow-hidden ${
                    activeTab === `playlist:${pl.id}`
                      ? 'bg-white/10 text-white border border-white/10 tab-active-glow pl-4'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div
                    style={{ background: pl.color || '#5e5ce6' }}
                    className="w-5 h-5 rounded-lg shrink-0 flex items-center justify-center shadow"
                  >
                    <Music className="w-2.5 h-2.5 text-white/90" />
                  </div>
                  <span className="truncate">{pl.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Settings & Collapse */}
      <div className="p-3 pb-24 md:pb-28 border-t border-white/[0.08] flex items-center justify-between gap-2">
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.06] ios-btn-spring transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-white/[0.06] ios-btn-spring transition-colors hidden md:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
