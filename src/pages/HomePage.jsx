import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUserStore } from '../stores/useUserStore';
import { useTasteStore } from '../stores/useTasteStore';
import { YouTubeAPI } from '../services/youtubeApi';
import { DailyMix } from '../components/recommendations/DailyMix';
import { DiscoverRadar } from '../components/recommendations/DiscoverRadar';
import { JumpBackIn } from '../components/recommendations/JumpBackIn';
import { Play, Sparkles, Flame, Radio, Coffee, Zap, Music2, Disc } from 'lucide-react';

const CATEGORY_PILLS = [
  { id: 'all', label: 'For You' },
  { id: 'pop', label: 'Pop', query: 'Top Pop Hits official audio' },
  { id: 'indie', label: 'Indie', query: 'Best Indie Pop Alternative songs official' },
  { id: 'kpop', label: 'K-Pop', query: 'Popular K-Pop hits official' },
  { id: 'rnb', label: 'R&B / Soul', query: 'Top R&B Soul Hits official' },
  { id: 'hiphop', label: 'Hip-Hop', query: 'Hip-Hop Rap Hits official' },
  { id: 'acoustic', label: 'Acoustic', query: 'Acoustic pop coffee chill official' },
  { id: 'rock', label: 'Rock', query: 'Modern Rock Alternative hits official' },
  { id: 'edm', label: 'EDM & Dance', query: 'Electronic Dance Music hits official' },
  { id: 'anime', label: 'Anime OST', query: 'Popular Anime OST songs official' }
];

export const HomePage = ({ onNavigateSearch, onOpenContextMenu }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const profile = useUserStore((s) => s.profile);
  const history = useUserStore((s) => s.history);
  const likedSongs = useUserStore((s) => s.likedSongs);

  const tasteProfile = useTasteStore((s) => s.profile);
  const tasteSections = useTasteStore((s) => s.sections);
  const isLoadingTaste = useTasteStore((s) => s.isLoading);
  const fetchRecommendations = useTasteStore((s) => s.fetchRecommendations);

  const [activePill, setActivePill] = useState('all');
  const [pillSection, setPillSection] = useState(null);
  const [loadingPill, setLoadingPill] = useState(false);

  // Initialize Personalized Feed
  useEffect(() => {
    const initialSeeds = [...likedSongs, ...history];
    fetchRecommendations(initialSeeds);
  }, [likedSongs.length, history.length]);

  // Handle Genre Pill Filter
  useEffect(() => {
    if (activePill === 'all') {
      setPillSection(null);
      return;
    }

    const loadPillTracks = async () => {
      setLoadingPill(true);
      const pill = CATEGORY_PILLS.find((p) => p.id === activePill);
      if (pill?.query) {
        const res = await YouTubeAPI.search(pill.query, 24);
        setPillSection({
          id: `sec_${activePill}`,
          title: `${pill.label} — Top Picks`,
          icon: Music2,
          tracks: res.items || []
        });
      }
      setLoadingPill(false);
    };

    loadPillTracks();
  }, [activePill]);

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const jumpBackTracks = tasteSections.jumpBackIn?.tracks?.length > 0
    ? tasteSections.jumpBackIn.tracks
    : [...likedSongs.slice(0, 3), ...history.slice(0, 3)];

  return (
    <div className="space-y-6 md:space-y-8 p-3.5 sm:p-5 md:p-8 font-syne select-none">
      {/* Hero Welcome */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white tracking-tight">
          {greeting()}, <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">{profile.username || 'Listener'}</span>
        </h1>
        <p className="text-[11px] md:text-sm text-zinc-400">
          Spatial acoustics curated dynamically to your vector taste.
        </p>
      </div>

      {/* iOS Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_PILLS.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActivePill(pill.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ios-pill-spring cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* If specific pill is selected, show pill results */}
      {activePill !== 'all' ? (
        loadingPill ? (
          <div className="space-y-4">
            <div className="h-6 w-48 bg-white/5 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-56 rounded-[22px] bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          pillSection && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white tracking-wide">{pillSection.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {pillSection.tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, pillSection.tracks, { type: 'pill_section', title: pillSection.title })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (onOpenContextMenu) onOpenContextMenu(e, track);
                    }}
                    className="group relative p-3.5 rounded-[22px] ios-card cursor-pointer shadow-lg flex flex-col justify-between ios-btn-spring"
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl bg-zinc-900 shadow-inner">
                      <img
                        src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track, pillSection.tracks, { type: 'pill_section', title: pillSection.title });
                        }}
                        className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 ios-btn-primary cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate group-hover:text-iosEmerald transition-colors">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )
      ) : (
        /* Main Personalized Feed (For You) */
        <div className="space-y-10">
          {/* 1. Quick Access Jump Back In (Top Frequent Rotation) */}
          {jumpBackTracks.length > 0 && <JumpBackIn tracks={jumpBackTracks} />}

          {/* 2. Personalized Daily Mixes (1, 2, 3) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Disc className="w-5 h-5 text-iosEmerald" />
              <h2 className="text-xl font-bold text-white tracking-tight">Made For You</h2>
            </div>

            {isLoadingTaste && !tasteSections.dailyMix1?.tracks?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 rounded-[26px] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasteSections.dailyMix1?.tracks?.length > 0 && (
                  <DailyMix mix={tasteSections.dailyMix1} index={0} />
                )}
                {tasteSections.dailyMix2?.tracks?.length > 0 && (
                  <DailyMix mix={tasteSections.dailyMix2} index={1} />
                )}
                {tasteSections.dailyMix3?.tracks?.length > 0 && (
                  <DailyMix mix={tasteSections.dailyMix3} index={2} />
                )}
              </div>
            )}
          </div>

          {/* 3. Discover Radar (Fresh unplayed tracks matching affinity) */}
          {tasteSections.discoverRadar?.tracks?.length > 0 && (
            <DiscoverRadar
              section={tasteSections.discoverRadar}
              onOpenContextMenu={onOpenContextMenu}
            />
          )}

          {/* 4. Top Daily Mix Highlights Grid */}
          {tasteSections.dailyMix1?.tracks?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Top Recommended Tracks
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {tasteSections.dailyMix1.tracks.slice(0, 10).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, tasteSections.dailyMix1.tracks, { type: 'daily_mix', title: tasteSections.dailyMix1.title })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (onOpenContextMenu) onOpenContextMenu(e, track);
                    }}
                    className="group relative p-3 rounded-2xl ios-card cursor-pointer shadow-lg flex flex-col justify-between ios-btn-spring"
                  >
                    <div className="relative aspect-square mb-2.5 overflow-hidden rounded-xl bg-zinc-900 shadow">
                      <img
                        src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track, tasteSections.dailyMix1.tracks, { type: 'daily_mix', title: tasteSections.dailyMix1.title });
                        }}
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 ios-btn-primary cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate group-hover:text-iosEmerald transition-colors">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
