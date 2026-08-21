import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { YouTubeAPI } from '../../services/youtubeApi';
import { Search, X, User, Play, Sparkles } from 'lucide-react';

export const Topbar = ({ onNavigateSearch, onNavigateProfile }) => {
  const profile = useUserStore((s) => s.profile);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

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

  return (
    <header className="sticky top-0 z-20 h-16 px-6 bg-zinc-950/70 backdrop-blur-xl border-b border-white/5 flex items-center justify-between font-syne select-none">
      {/* Search Bar */}
      <div ref={containerRef} className="relative w-full max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search songs, artists, vibes..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:bg-white/10 transition-all font-syne"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute right-3 text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl space-y-1 z-50">
            {loading ? (
              <div className="p-4 text-center text-xs text-zinc-500">Searching YouTube...</div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">No instant results found</div>
            ) : (
              suggestions.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    playTrack(track);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <img src={track.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">{track.artist}</div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls (Backend status + User avatar) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Backend Ready
        </div>

        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-white/5 border border-white/5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-extrabold shadow">
            {profile.username ? profile.username[0].toUpperCase() : 'L'}
          </div>
          <span className="text-xs font-bold text-white hidden sm:block">{profile.username || 'Listener'}</span>
        </button>
      </div>
    </header>
  );
};
