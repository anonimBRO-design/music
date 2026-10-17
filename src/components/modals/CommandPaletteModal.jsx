import React, { useState, useEffect, useRef } from 'react';
import { useStudioStore } from '../../stores/useStudioStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import { YouTubeAPI } from '../../services/youtubeApi';
import {
  Search,
  Command,
  Play,
  Home,
  Heart,
  Clock,
  Library,
  Sliders,
  Moon,
  AppWindow,
  PanelRight,
  Sun,
  X
} from 'lucide-react';

export const CommandPaletteModal = ({ onSelectTab, onNavigateSearch }) => {
  const isOpen = useStudioStore((s) => s.isCommandPaletteOpen);
  const close = useStudioStore((s) => s.toggleCommandPalette);
  const toggleInspector = useStudioStore((s) => s.toggleInspector);
  const toggleMiniPlayer = useStudioStore((s) => s.toggleMiniPlayer);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const toggleTheme = useUserStore((s) => s.toggleTheme);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await YouTubeAPI.search(query, 6);
        setResults(res.items || []);
        setSelectedIndex(0);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Static actions when no query is typed
  const defaultActions = [
    {
      id: 'tab-home',
      label: 'Jump to Home / For You',
      icon: Home,
      category: 'Navigate',
      action: () => {
        onSelectTab('home');
        close();
      }
    },
    {
      id: 'tab-liked',
      label: 'Jump to Liked Songs',
      icon: Heart,
      category: 'Navigate',
      action: () => {
        onSelectTab('liked');
        close();
      }
    },
    {
      id: 'tab-history',
      label: 'Jump to Playback History',
      icon: Clock,
      category: 'Navigate',
      action: () => {
        onSelectTab('history');
        close();
      }
    },
    {
      id: 'tab-library',
      label: 'Jump to Library',
      icon: Library,
      category: 'Navigate',
      action: () => {
        onSelectTab('library');
        close();
      }
    },
    {
      id: 'toggle-inspector',
      label: 'Toggle Studio Inspector (Ctrl+I)',
      icon: PanelRight,
      category: 'Workspace',
      action: () => {
        toggleInspector();
        close();
      }
    },
    {
      id: 'toggle-mini',
      label: 'Toggle Mini-Player HUD',
      icon: AppWindow,
      category: 'Workspace',
      action: () => {
        toggleMiniPlayer();
        close();
      }
    },
    {
      id: 'action-eq',
      label: 'Open Studio Equalizer',
      icon: Sliders,
      category: 'Audio',
      action: () => {
        window.dispatchEvent(new CustomEvent('nonimsong:open-equalizer'));
        close();
      }
    },
    {
      id: 'action-theme',
      label: 'Toggle Dark / Light Mode',
      icon: Sun,
      category: 'System',
      action: () => {
        toggleTheme();
        close();
      }
    }
  ];

  if (!isOpen) return null;

  const currentItems = query.trim() ? results : defaultActions;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, currentItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentItems.length > 0) {
        const item = currentItems[selectedIndex];
        if (query.trim()) {
          // It's a track
          playTrack(item);
          close();
        } else {
          // It's an action
          item.action();
        }
      } else if (query.trim()) {
        onNavigateSearch(query.trim());
        close();
      }
    }
  };

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 font-mono select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-dawSurface border border-dawBorderBright rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-dawBorder bg-dawBg">
          <Search className="w-4 h-4 text-dawMuted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a track, artist, page (/home), or command..."
            className="w-full bg-transparent text-sm text-white placeholder-dawMuted focus:outline-none font-mono"
          />
          {loading && (
            <span className="w-2 h-2 rounded-full bg-dawCyan animate-ping shrink-0" />
          )}
          <button
            onClick={close}
            className="text-dawMuted hover:text-white p-1 rounded hover:bg-dawHover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of items */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-dawBorder/30">
          {query.trim() ? (
            // Track Results
            results.length === 0 && !loading ? (
              <div className="py-8 text-center text-xs text-dawMuted">
                No signal found. Press <kbd className="px-1 py-0.5 rounded bg-dawPanel border border-dawBorder">Enter</kbd> to search YouTube catalogue.
              </div>
            ) : (
              results.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => {
                    playTrack(track);
                    close();
                  }}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    selectedIndex === idx ? 'bg-dawPanel border border-dawCyan/60 text-white' : 'hover:bg-dawHover text-dawMuted'
                  }`}
                >
                  <img
                    src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                    alt=""
                    className="w-8 h-8 rounded object-cover bg-dawBg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{track.title}</div>
                    <div className="text-[10px] text-dawMuted truncate">{track.artist}</div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-dawGreen shrink-0" />
                </div>
              ))
            )
          ) : (
            // Default Studio Actions
            defaultActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  onClick={() => act.action()}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedIndex === idx ? 'bg-dawPanel border border-dawCyan/60 text-white' : 'hover:bg-dawHover text-dawMuted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-dawAmber shrink-0" />
                    <span className="text-xs text-white">{act.label}</span>
                  </div>
                  <span className="text-[10px] text-dawMuted uppercase">{act.category}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-3 py-2 border-t border-dawBorder bg-dawBg/60 flex items-center justify-between text-[10px] text-dawMuted">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-dawAmber font-bold">COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  );
};
