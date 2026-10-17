import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useStudioStore } from '../../stores/useStudioStore';
import { YouTubeAPI } from '../../services/youtubeApi';
import {
  Search,
  X,
  User,
  Play,
  Sun,
  Moon,
  LayoutGrid,
  ListFilter,
  PanelRightOpen,
  PanelRightClose,
  Sliders,
  Command
} from 'lucide-react';

export const Topbar = ({ activeTab, onNavigateSearch, onNavigateProfile }) => {
  const profile = useUserStore((s) => s.profile);
  const theme = useUserStore((s) => s.theme);
  const toggleTheme = useUserStore((s) => s.toggleTheme);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const isSearchTab = activeTab === 'search';

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
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
    if (activeTab === 'party') return 'LINK // LISTENING PARTY';
    if (activeTab === 'wrapped') return 'TELEMETRY // WRAPPED';
    if (activeTab === 'admin') return 'SYSTEM // ADMIN';
    return 'STAGE // WORKSPACE';
  };

  return (
    <header className="sticky top-0 z-20 h-13 px-4 bg-dawSurface border-b border-dawBorder flex items-center justify-between font-mono select-none">
      {/* Left: Mobile Logo & Studio Breadcrumb */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onNavigateSearch?.('home')}
          className="flex items-center gap-2 md:hidden shrink-0 cursor-pointer"
        >
          <img src="/icons/logo.png" alt="NONIMSONG" className="w-6 h-6 object-contain" />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold tracking-wider text-dawMuted">
          <span className="w-2 h-2 rounded-sm bg-dawAmber" />
          <span className="text-white font-mono">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center: Search & Command Palette Launcher */}
      <div ref={containerRef} className="relative w-full max-w-sm mx-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-dawMuted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tracks, artists, ID..."
            className="w-full bg-dawBg border border-dawBorder hover:border-dawBorderBright focus:border-dawCyan rounded pl-8 pr-16 py-1.5 text-xs text-white placeholder-dawMuted focus:outline-none transition-all font-mono"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute right-2 text-dawMuted hover:text-white p-1 rounded hover:bg-dawHover cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={toggleCommandPalette}
              className="absolute right-1.5 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-dawPanel border border-dawBorder text-[10px] text-dawMuted hover:text-dawCyan hover:border-dawCyan transition-all cursor-pointer font-mono"
              title="Open Command Palette (Ctrl+K)"
            >
              <span>Ctrl</span>
              <span>K</span>
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-dawSurface border border-dawBorder rounded shadow-2xl p-1.5 space-y-1 z-50 animate-search-drop-in font-syne">
            {loading ? (
              <div className="p-3 text-center text-xs text-dawMuted flex items-center justify-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-dawCyan animate-ping" />
                POLLING YOUTUBE...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-3 text-center text-xs text-dawMuted font-mono">NO SIGNAL FOUND</div>
            ) : (
              suggestions.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    playTrack(track);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1.5 rounded hover:bg-dawHover cursor-pointer transition-colors group"
                >
                  <img
                    src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                    }}
                    className="w-8 h-8 rounded object-cover shrink-0 bg-dawBg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate group-hover:text-dawCyan transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-dawMuted truncate">{track.artist}</div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-dawGreen opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls: View Switcher, Inspector Toggle, Theme, User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* View Switcher (Table / Cards) */}
        <button
          onClick={toggleViewMode}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-dawPanel hover:bg-dawHover border border-dawBorder text-xs text-dawMuted hover:text-white transition-colors"
          title={`Switch view (Current: ${viewMode === 'table' ? 'Pro Table' : 'Media Cards'})`}
        >
          {viewMode === 'table' ? (
            <>
              <ListFilter className="w-3.5 h-3.5 text-dawCyan" />
              <span className="text-[10px] uppercase font-mono hidden xl:inline">Table</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-3.5 h-3.5 text-dawAmber" />
              <span className="text-[10px] uppercase font-mono hidden xl:inline">Cards</span>
            </>
          )}
        </button>

        {/* Inspector Toggle Button */}
        <button
          onClick={toggleInspector}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-colors ${
            isInspectorOpen
              ? 'bg-dawPanel text-dawAmber border-dawAmber/40'
              : 'bg-dawPanel hover:bg-dawHover text-dawMuted hover:text-white border-dawBorder'
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
          className="w-7 h-7 rounded flex items-center justify-center bg-dawPanel hover:bg-dawHover border border-dawBorder text-white transition-all cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-dawAmber" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-dawCyan" />
          )}
        </button>

        {/* Engine Ready Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-dawGreen/10 border border-dawGreen/30 text-[10px] font-mono text-dawGreen">
          <span className="w-1.5 h-1.5 rounded-full bg-dawGreen animate-pulse" />
          <span>DSP ON</span>
        </div>

        {/* Profile Pill */}
        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-2 p-1 pr-2 rounded bg-dawPanel hover:bg-dawHover border border-dawBorder transition-all cursor-pointer"
        >
          <div className="w-5 h-5 rounded bg-dawAmber text-black font-mono flex items-center justify-center text-[10px] font-bold">
            {profile.username ? profile.username[0].toUpperCase() : 'L'}
          </div>
          <span className="text-[11px] font-mono text-white hidden sm:block max-w-[80px] truncate">
            {profile.username || 'Listener'}
          </span>
        </button>
      </div>
    </header>
  );
};
