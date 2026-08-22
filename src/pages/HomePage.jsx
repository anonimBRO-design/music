import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUserStore } from '../stores/useUserStore';
import { YouTubeAPI } from '../services/youtubeApi';
import { Play, Sparkles, Flame, Radio, Coffee, Zap, Music2, Disc } from 'lucide-react';

const CATEGORY_PILLS = [
  { id: 'all', label: 'All' },
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

// Diversity Engine to filter out hour-long full album loop mixes and diversify artists
const DiversityEngine = {
  filterCleanTracks(items) {
    const artistCount = {};
    return (items || []).filter((item) => {
      if (!item || !item.id) return false;
      const title = (item.title || '').toLowerCase();
      // Filter out hour-long compilations/mixes
      if (
        title.includes('1 hour') ||
        title.includes('2 hours') ||
        title.includes('3 hours') ||
        title.includes('10 hours') ||
        title.includes('full album') ||
        title.includes('mix 202') ||
        title.includes('compilation')
      ) {
        return false;
      }
      const artist = (item.artist || '').toLowerCase();
      artistCount[artist] = (artistCount[artist] || 0) + 1;
      return artistCount[artist] <= 2;
    });
  }
};

export const HomePage = ({ onNavigateSearch, onOpenContextMenu }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const profile = useUserStore((s) => s.profile);
  const history = useUserStore((s) => s.history);
  const likedSongs = useUserStore((s) => s.likedSongs);

  const [activePill, setActivePill] = useState('all');
  const [sections, setSections] = useState([]);
  const [quickGrid, setQuickGrid] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSmartHome = async () => {
      setLoading(true);

      // If a specific genre pill is selected
      if (activePill !== 'all') {
        const pill = CATEGORY_PILLS.find((p) => p.id === activePill);
        if (pill?.query) {
          const res = await YouTubeAPI.search(pill.query, 24);
          const cleanTracks = DiversityEngine.filterCleanTracks(res.items || []);
          setSections([
            {
              id: `sec_${activePill}`,
              title: `${pill.label} — Top Picks`,
              icon: Music2,
              color: 'text-emerald-400',
              tracks: cleanTracks.slice(0, 16)
            }
          ]);
          setLoading(false);
          return;
        }
      }

      // 1. Analyze User Taste for "Made For You"
      const recentTracks = [...history, ...likedSongs];
      const artistMap = {};
      recentTracks.forEach((t) => {
        if (t.artist && !t.artist.toLowerCase().includes('lirik') && !t.artist.toLowerCase().includes('topic')) {
          artistMap[t.artist] = (artistMap[t.artist] || 0) + 1;
        }
      });

      const topArtists = Object.keys(artistMap).sort((a, b) => artistMap[b] - artistMap[a]);
      const favArtist = topArtists[0] || null;
      const secondArtist = topArtists[1] || null;

      // 2. Build Spotify-Grade Sections
      const sectionConfigs = [
        {
          id: 'sec_top_hits',
          title: "🔥 Today's Top Hits",
          query: 'Todays Top Hits Billboard global pop songs official',
          icon: Flame,
          color: 'text-rose-400'
        }
      ];

      if (favArtist) {
        sectionConfigs.push({
          id: 'sec_fav',
          title: `✨ Daily Mix: ${favArtist} & Similar`,
          query: `${favArtist} official music video audio`,
          icon: Disc,
          color: 'text-emerald-400'
        });
      }

      if (secondArtist) {
        sectionConfigs.push({
          id: 'sec_sim',
          title: `🎯 Recommended: More of ${secondArtist}`,
          query: `${secondArtist} popular songs official`,
          icon: Sparkles,
          color: 'text-cyan-400'
        });
      }

      sectionConfigs.push({
        id: 'sec_pop_rising',
        title: '🌟 Pop Rising & Viral Hits',
        query: 'Pop Rising Spotify viral songs official',
        icon: Zap,
        color: 'text-amber-400'
      });

      sectionConfigs.push({
        id: 'sec_chill',
        title: '☕ Chill & Acoustic Afternoon',
        query: 'Acoustic Pop coffee chill songs official audio',
        icon: Coffee,
        color: 'text-purple-400'
      });

      sectionConfigs.push({
        id: 'sec_night',
        title: '🌙 Late Night Drive & Synth',
        query: 'Synthwave Night Drive retro pop songs official',
        icon: Radio,
        color: 'text-indigo-400'
      });

      // 3. Fetch sections in parallel
      try {
        const results = await Promise.all(
          sectionConfigs.map((sec) => YouTubeAPI.search(sec.query, 12))
        );

        const loadedSections = sectionConfigs.map((sec, idx) => ({
          ...sec,
          tracks: DiversityEngine.filterCleanTracks(results[idx]?.items || []).slice(0, 8)
        }));

        setSections(loadedSections);

        // Build quick grid (up to 6 cards from liked or top tracks)
        const gridItems = [
          ...likedSongs.slice(0, 3),
          ...history.slice(0, 3),
          ...(loadedSections[0]?.tracks || []).slice(0, 6)
        ].slice(0, 6);

        setQuickGrid(gridItems);
      } catch (err) {
        console.warn('Home recommendation load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSmartHome();
  }, [activePill, history, likedSongs]);

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 p-5 md:p-8 font-syne select-none">
      {/* Hero Welcome */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
          {greeting()}, <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">{profile.username || 'Listener'}</span>
        </h1>
        <p className="text-xs md:text-sm text-zinc-400">
          Spatial curated acoustics and live charts.
        </p>
      </div>

      {/* Quick Access 6-Card Grid */}
      {quickGrid.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickGrid.map((track, i) => (
            <div
              key={`${track.id}-${i}`}
              onClick={() => playTrack(track, quickGrid, { type: 'home_quick', title: 'Quick Picks' })}
              className="flex items-center gap-3 p-2.5 rounded-2xl ios-card cursor-pointer group shadow-md ios-btn-spring"
            >
              <img
                src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                }}
                className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md bg-zinc-900"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-iosEmerald transition-colors">
                  {track.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">{track.artist}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(track, quickGrid, { type: 'home_quick', title: 'Quick Picks' });
                }}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all shrink-0 hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* iOS Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_PILLS.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActivePill(pill.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ios-btn-spring ${
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

      {/* Dynamic Recommendation Sections */}
      {loading ? (
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-48 bg-white/5 rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-56 rounded-[22px] bg-white/5 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((sec) => {
            const Icon = sec.icon || Sparkles;
            if (!sec.tracks?.length) return null;
            return (
              <div key={sec.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${sec.color}`} />
                  <h2 className="text-lg font-bold text-white tracking-wide">{sec.title}</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {sec.tracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, sec.tracks, { type: 'home_section', id: sec.id, title: sec.title })}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (onOpenContextMenu) onOpenContextMenu(e, track);
                      }}
                      className="group relative p-3.5 rounded-[22px] ios-card cursor-pointer shadow-lg flex flex-col justify-between"
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
                            playTrack(track, sec.tracks, { type: 'home_section', id: sec.id, title: sec.title });
                          }}
                          className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:scale-105"
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
            );
          })}
        </div>
      )}
    </div>
  );
};
