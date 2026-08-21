import React, { useState, useEffect } from 'react';
import { YouTubeAPI } from '../services/youtubeApi';
import { PlaylistTable } from '../components/playlist/PlaylistTable';
import { Search as SearchIcon, Compass, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { name: 'Phonk', color: 'from-purple-900 to-indigo-950', query: 'phonk drift beats' },
  { name: 'Lo-Fi Chill', color: 'from-pink-900 to-rose-950', query: 'lofi hip hop beats' },
  { name: 'Synthwave', color: 'from-cyan-900 to-blue-950', query: 'synthwave retro night' },
  { name: 'Hip-Hop', color: 'from-amber-900 to-orange-950', query: 'hip hop rap hits' },
  { name: 'Dark Ambient', color: 'from-zinc-800 to-zinc-950', query: 'dark ambient soundscape' },
  { name: 'Indie Pop', color: 'from-emerald-900 to-teal-950', query: 'indie pop alternative' },
  { name: 'Gaming Beats', color: 'from-red-900 to-rose-950', query: 'gaming music epic mix' },
  { name: 'Anime Vibes', color: 'from-fuchsia-900 to-purple-950', query: 'anime ost lofi mix' }
];

export const SearchPage = ({ initialQuery = '', onOpenContextMenu }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchTerm) => {
    const q = searchTerm.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    const res = await YouTubeAPI.search(q, 25);
    setResults(res.items || []);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch(query);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8 font-syne select-none">
      {/* Search Header Bar */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to listen to?"
          className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-28 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:bg-white/10 transition-all font-syne shadow-xl"
          autoFocus={!initialQuery}
        />
        <button
          onClick={() => performSearch(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-black transition-all shadow-md"
        >
          Search
        </button>
      </div>

      {/* Results or Categories */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
          <span className="text-xs text-zinc-500 font-semibold">Searching YouTube catalogue...</span>
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wide">Results for "{query}"</h2>
            <span className="text-xs text-zinc-500">{results.length} songs found</span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-20 text-sm text-zinc-500">
              No results found for "{query}". Try a different keyword!
            </div>
          ) : (
            <PlaylistTable
              tracks={results}
              collectionTitle={`Search: ${query}`}
              onOpenContextMenu={onOpenContextMenu}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">Browse All Categories</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                onClick={() => {
                  setQuery(cat.query);
                  performSearch(cat.query);
                }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${cat.color} border border-white/5 hover:border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 group relative overflow-hidden h-32 flex items-end`}
              >
                <span className="text-base md:text-lg font-extrabold text-white group-hover:underline">
                  {cat.name}
                </span>
                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
