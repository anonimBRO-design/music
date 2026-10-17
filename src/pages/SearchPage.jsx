import React, { useState, useEffect } from 'react';
import { YouTubeAPI } from '../services/youtubeApi';
import { PlaylistTable } from '../components/playlist/PlaylistTable';
import { Search as SearchIcon, Compass, Sparkles, Flame, Music, Radio, Coffee, Zap, Disc, Mic2, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { name: 'Pop Hits', query: 'top global pop hits official audio', icon: Flame },
  { name: 'Indo Pop & Viral', query: 'top lagu pop indonesia hits viral official', icon: Music },
  { name: 'K-Pop', query: 'top k-pop songs official music video', icon: Sparkles },
  { name: 'Hip-Hop & Rap', query: 'top hip hop and rap songs official audio', icon: Mic2 },
  { name: 'R&B & Soul', query: 'top rnb and soul hits official audio', icon: Disc },
  { name: 'Indie & Alternative', query: 'best indie alternative songs official', icon: Sparkles },
  { name: 'Acoustic & Coffee', query: 'acoustic pop chill coffeehouse official', icon: Coffee },
  { name: 'Dance & EDM', query: 'electronic dance music edm festival hits official', icon: Zap },
  { name: 'Rock & Modern', query: 'top rock alternative hits official', icon: Flame },
  { name: 'Viral Hits 2026', query: 'top viral trending hits 2026 official', icon: Zap },
  { name: 'Lo-Fi Chill', query: 'lofi hip hop chill study beats official', icon: Radio },
  { name: 'Anime OST & J-Pop', query: 'popular anime ost j-pop songs official', icon: Sparkles }
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
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto select-none font-sans">
      {/* Search Header Bar */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to listen to?"
          className="w-full bg-surface border border-border rounded-xl pl-11 pr-28 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          autoFocus={!initialQuery}
        />
        <button
          onClick={() => performSearch(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-[var(--shadow-warm)] cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Results or Categories */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <span className="text-xs text-text-muted font-medium">Searching music catalogue...</span>
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-text-main tracking-tight">Results for "{query}"</h2>
              <span className="text-xs text-text-muted font-mono">{results.length} songs found</span>
            </div>
            <button
              onClick={() => {
                setSearched(false);
                setQuery('');
                setResults([]);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-20 text-sm text-text-muted card-soft p-8 rounded-2xl border border-border">
              No results found for "{query}". Try a different keyword or artist.
            </div>
          ) : (
            <div className="card-soft border border-border rounded-2xl overflow-hidden p-2 sm:p-4">
              <PlaylistTable
                tracks={results}
                collectionTitle={`Search: ${query}`}
                onOpenContextMenu={onOpenContextMenu}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-extrabold text-text-main tracking-tight">Browse Genres & Moods</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon || Sparkles;
              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    setQuery(cat.name);
                    performSearch(cat.query);
                  }}
                  className="card-soft hover:card-elev hover:border-primary/40 p-5 rounded-2xl transition-all cursor-pointer group relative overflow-hidden h-32 sm:h-36 flex flex-col justify-between border border-border"
                >
                  <span className="text-sm sm:text-base font-bold text-text-main group-hover:text-primary transition-colors leading-tight">
                    {cat.name}
                  </span>
                  <div className="self-end p-2.5 rounded-xl bg-surface-2 group-hover:bg-primary/10 text-text-muted group-hover:text-primary transition-all">
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
