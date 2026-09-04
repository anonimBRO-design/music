import React, { useState, useEffect } from 'react';
import { YouTubeAPI } from '../services/youtubeApi';
import { PlaylistTable } from '../components/playlist/PlaylistTable';
import { Search as SearchIcon, Compass, Sparkles, Flame, Music, Radio, Coffee, Zap, Disc, Mic2 } from 'lucide-react';

const CATEGORIES = [
  { name: 'Pop Hits', color: 'from-rose-500 to-red-700', query: 'top global pop hits official audio', icon: Flame },
  { name: 'Indo Pop & Viral', color: 'from-emerald-500 to-teal-700', query: 'top lagu pop indonesia hits viral official', icon: Music },
  { name: 'K-Pop', color: 'from-pink-500 to-purple-700', query: 'top k-pop songs official music video', icon: Sparkles },
  { name: 'Hip-Hop & Rap', color: 'from-amber-500 to-orange-700', query: 'top hip hop and rap songs official audio', icon: Mic2 },
  { name: 'R&B & Soul', color: 'from-indigo-500 to-purple-700', query: 'top rnb and soul hits official audio', icon: Disc },
  { name: 'Indie & Alternative', color: 'from-teal-600 to-emerald-800', query: 'best indie alternative songs official', icon: Sparkles },
  { name: 'Acoustic & Coffee', color: 'from-yellow-600 to-amber-800', query: 'acoustic pop chill coffeehouse official', icon: Coffee },
  { name: 'Dance & EDM', color: 'from-cyan-500 to-blue-700', query: 'electronic dance music edm festival hits official', icon: Zap },
  { name: 'Rock & Modern', color: 'from-red-600 to-stone-800', query: 'top rock alternative hits official', icon: Flame },
  { name: 'Viral Hits 2026', color: 'from-fuchsia-500 to-rose-700', query: 'top viral trending hits 2026 official', icon: Zap },
  { name: 'Lo-Fi Chill', color: 'from-blue-600 to-indigo-900', query: 'lofi hip hop chill study beats official', icon: Radio },
  { name: 'Anime OST & J-Pop', color: 'from-purple-500 to-pink-700', query: 'popular anime ost j-pop songs official', icon: Sparkles }
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
    <div className="space-y-8 p-6 md:p-8 font-syne select-none">
      {/* Search Header Bar */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to listen to?"
          className="w-full bg-white/[0.06] border border-white/10 rounded-full pl-12 pr-28 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-iosBlue/70 focus:bg-white/[0.09] focus:shadow-[0_0_25px_rgba(10,132,255,0.25)] transition-all font-syne shadow-2xl"
          autoFocus={!initialQuery}
        />
        <button
          onClick={() => performSearch(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full text-xs font-bold bg-white text-black hover:bg-zinc-200 ios-btn-spring transition-all shadow-md cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Results or Categories */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-iosEmerald/20 border-t-iosEmerald animate-spin" />
          <span className="text-xs text-zinc-400 font-semibold">Searching music catalogue...</span>
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide">Results for "{query}"</h2>
              <span className="text-xs text-zinc-400">{results.length} songs found</span>
            </div>
            <button
              onClick={() => {
                setSearched(false);
                setQuery('');
                setResults([]);
              }}
              className="text-xs font-bold text-iosEmerald hover:underline ios-btn-spring cursor-pointer"
            >
              ← Back to Categories
            </button>
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
            <Compass className="w-5 h-5 text-iosEmerald" />
            <h2 className="text-xl font-extrabold text-white tracking-wide">Browse All Categories</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon || Sparkles;
              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    setQuery(cat.name);
                    performSearch(cat.query);
                  }}
                  className={`p-5 rounded-[24px] bg-gradient-to-br ${cat.color} border border-white/10 hover:border-white/25 transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.03] group relative overflow-hidden h-36 flex flex-col justify-between ios-btn-spring`}
                >
                  <span className="text-base md:text-lg font-black text-white leading-tight group-hover:underline">
                    {cat.name}
                  </span>
                  <div className="self-end p-2.5 rounded-full bg-black/25 backdrop-blur-md text-white/85 group-hover:text-white transition-all transform group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
