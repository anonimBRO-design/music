import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUserStore } from '../stores/useUserStore';
import { YouTubeAPI } from '../services/youtubeApi';
import { Play, Sparkles, Flame, Radio } from 'lucide-react';

const MOODS = ['Phonk', 'Synthwave', 'Lo-Fi Chill', 'Hip-Hop Vibes', 'Dark Ambient', 'Indie Pop', 'Night Drive'];

export const HomePage = ({ onNavigateSearch, onOpenContextMenu }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const profile = useUserStore((s) => s.profile);
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      const [featRes, trendRes] = await Promise.all([
        YouTubeAPI.search('aesthetic phonk lofi night drive beats', 8),
        YouTubeAPI.search('popular hits music 2026', 8)
      ]);
      setFeaturedTracks(featRes.items || []);
      setTrendingTracks(trendRes.items || []);
      setLoading(false);
    };
    loadHomeData();
  }, []);

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 p-6 md:p-8 font-syne select-none">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">
            {greeting()}, {profile.username || 'Listener'}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Handcrafted soundscapes and instant YouTube streaming.
          </p>
        </div>
      </div>

      {/* Mood Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => onNavigateSearch(mood)}
            className="px-4 py-2 rounded-full text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white transition-all shrink-0 hover:scale-105"
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Featured Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">Featured Vibes</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, featuredTracks, { type: 'home_featured', title: 'Featured Vibes' })}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (onOpenContextMenu) onOpenContextMenu(e, track);
                }}
                className="group relative p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-lg hover:shadow-2xl"
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                  <img
                    src={track.thumbnail}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(track, featuredTracks, { type: 'home_featured', title: 'Featured Vibes' });
                    }}
                    className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
                <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {track.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Hits Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-bold text-white tracking-wide">Popular Right Now</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trendingTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, trendingTracks, { type: 'home_trending', title: 'Popular Hits' })}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (onOpenContextMenu) onOpenContextMenu(e, track);
                }}
                className="group relative p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-lg hover:shadow-2xl"
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                  <img
                    src={track.thumbnail}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(track, trendingTracks, { type: 'home_trending', title: 'Popular Hits' });
                    }}
                    className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
                <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {track.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
