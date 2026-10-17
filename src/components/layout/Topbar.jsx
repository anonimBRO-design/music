import React, { useState, useEffect, useRef } from 'react';
import { useUserStore, ACCENT_THEMES } from '../../stores/useUserStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useStudioStore } from '../../stores/useStudioStore';
import { YouTubeAPI } from '../../services/youtubeApi';
import {
  Search,
  X,
  Play,
  Sun,
  Moon,
  LayoutGrid,
  ListFilter,
  PanelRightOpen,
  PanelRightClose,
  Palette
} from 'lucide-react';

export const Topbar = ({ activeTab, onNavigateSearch, onNavigateProfile }) => {
  const profile = useUserStore((s) => s.profile);
  const theme = useUserStore((s) => s.theme);
  const toggleTheme = useUserStore((s) => s.toggleTheme);
  const accent = useUserStore((s) => s.accent);
  const setAccent = useUserStore((s) => s.setAccent);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  const containerRef = useRef(null);
  const accentRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (accentRef.current && !accentRef.current.contains(e.target)) {
        setShowAccentPicker(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const handleSearchChange = async (val) => {
    setQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    setIsOpen(true);
    const res = await YouTubeAPI.search(val, 5);
    setSuggestions(res.items || []);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      onNavigateSearch(query.trim());
    }
  };

  const isInspectorOpen = useStudioStore((s) => s.isInspectorOpen);
  const toggleInspector = useStudioStore((s) => s.toggleInspector);
  const viewMode = useStudioStore((s) => s.viewMode);
  const toggleViewMode = useStudioStore((s) => s.toggleViewMode);
  const toggleCommandPalette = useStudioStore((s) => s.toggleCommandPalette);

  const getBreadcrumb = () => {
    if (activeTab === 'home') return 'STAGE // FOR YOU';
    if (activeTab === 'search') return 'QUERY // DATABASE';
    if (activeTab === 'liked') return 'ARCHIVE // LIKED';
    if (activeTab === 'history') return 'AUDIT // HISTORY';
    if (activeTab === 'library') return 'COLLECTION // LIBRARY';
    if (activeTab.startsWith('playlist:')) return 'PLAYLIST // SESSION';
    if (activeTab === 'admin') return 'SYSTEM // ADMIN';
    return 'STAGE // WORKSPACE';
  };

  return (
    <header className="sticky top-0 z-20 h-13 px-4 bg-sidebar/85 backdrop-blur-xl border-b border-border flex items-center justify-between select-none">
      {/* Left: Mobile Logo & Studio Breadcrumb */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onNavigateSearch?.('home')}
          className="flex items-center gap-2 md:hidden shrink-0 cursor-pointer"
        >
          <img src="/icons/logo.png" alt="NONIMSONG" className="w-6 h-6 object-contain" />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium tracking-wider text-text-muted">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
          <span className="text-text-main font-mono text-xs">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center: 9Router Search & Command Palette Launcher */}
      <div ref={containerRef} className="relative w-full max-w-sm mx-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tracks, artists, ID..."
            className="w-full bg-surface border border-border hover:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-8 pr-16 py-1.5 text-xs text-text-main placeholder-text-subtle focus:outline-none transition-all font-mono"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute right-2 text-text-muted hover:text-text-main p-1 rounded hover:bg-surface-2 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={toggleCommandPalette}
              className="absolute right-1.5 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[10px] text-text-muted hover:text-primary hover:border-primary transition-all cursor-pointer font-mono"
              title="Open Command Palette (Ctrl+K)"
            >
              <span>Ctrl</span>
              <span>K</span>
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-elevated p-1.5 space-y-1 z-50 animate-search-drop-in">
            {loading ? (
              <div className="p-3 text-center text-xs text-text-muted flex items-center justify-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                POLLING YOUTUBE...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-3 text-center text-xs text-text-muted font-mono">NO SIGNAL FOUND</div>
            ) : (
              suggestions.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    playTrack(track);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-2 cursor-pointer transition-colors group"
                >
                  <img
                    src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                    }}
                    className="w-8 h-8 rounded object-cover shrink-0 bg-surface-3"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-main truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">{track.artist}</div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Accent Switcher, View Switcher, Inspector Toggle, Theme, User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 9Router Multi-Accent Switcher */}
        <div ref={accentRef} className="relative">
          <button
            type="button"
            onClick={() => setShowAccentPicker(!showAccentPicker)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-muted hover:text-text-main transition-all cursor-pointer shadow-soft"
            title="Switch 9Router Accent Color"
          >
            <div
              className="w-3 h-3 rounded-full shadow-[0_0_8px_var(--color-primary)] transition-transform hover:scale-110"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <span className="hidden xl:inline text-[11px] font-medium capitalize">
              {accent}
            </span>
          </button>

          {showAccentPicker && (
            <div className="absolute right-0 top-full mt-1.5 w-48 p-2 rounded-xl bg-surface border border-border shadow-elevated z-50 animate-search-drop-in backdrop-blur-2xl space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted/70">
                Accent Palette
              </div>
              {ACCENT_THEMES.map((themeItem) => (
                <button
                  key={themeItem.id}
                  onClick={() => {
                    setAccent(themeItem.id);
                    setShowAccentPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    accent === themeItem.id
                      ? 'bg-primary/15 text-primary font-semibold border border-primary/25'
                      : 'text-text-muted hover:bg-surface-2 hover:text-text-main border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: themeItem.color }}
                    />
                    <span>{themeItem.label}</span>
                  </div>
                  {accent === themeItem.id && (
                    <span className="text-[10px] text-primary font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher (Table / Cards) */}
        <button
          onClick={toggleViewMode}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer"
          title={`Switch view (Current: ${viewMode === 'table' ? 'Pro Table' : 'Media Cards'})`}
        >
          {viewMode === 'table' ? (
            <>
              <ListFilter className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] uppercase font-mono hidden xl:inline">Table</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] uppercase font-mono hidden xl:inline">Cards</span>
            </>
          )}
        </button>

        {/* Inspector Toggle Button */}
        <button
          onClick={toggleInspector}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
            isInspectorOpen
              ? 'bg-primary/15 text-primary border-primary/25 shadow-[var(--shadow-warm)] font-medium'
              : 'bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-text-main border-border'
          }`}
          title="Toggle Studio Inspector (Ctrl+I)"
        >
          {isInspectorOpen ? (
            <PanelRightClose className="w-3.5 h-3.5" />
          ) : (
            <PanelRightOpen className="w-3.5 h-3.5" />
          )}
          <span className="text-[10px] uppercase font-mono hidden xl:inline">Inspector</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-2 hover:bg-surface-3 border border-border text-text-main transition-all cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-primary" />
          )}
        </button>

        {/* Profile Pill */}
        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-2 p-1 pr-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border transition-all cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 text-white font-mono flex items-center justify-center text-[10px] font-bold shadow-[var(--shadow-warm)]">
            {profile.username ? profile.username[0].toUpperCase() : 'L'}
          </div>
          <span className="text-xs text-text-main hidden sm:block max-w-[80px] truncate">
            {profile.username || 'Listener'}
          </span>
        </button>
      </div>
    </header>
  );
};
