import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import { useToastStore } from '../../stores/useToastStore';
import { useStudioStore } from '../../stores/useStudioStore';
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Music,
  Plus
} from 'lucide-react';

export const PlaylistTable = ({
  tracks = [],
  playlistId = null,
  collectionTitle = 'Collection',
  onReorder = null,
  onOpenContextMenu = null
}) => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const liveAudioDuration = usePlayerStore((s) => s.duration);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);
  const showToast = useToastStore((s) => s.showToast);

  const viewMode = useStudioStore((s) => s.viewMode);

  // Sorting State
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Keyboard navigation focus state
  const [focusedIndex, setFocusedIndex] = useState(0);
  const tableRef = useRef(null);

  const getTrackDuration = (t) => {
    if (!t) return '--:--';
    const tId = typeof t.id === 'string' ? t.id : (t.id?.videoId || String(t.id));
    const isCurrent = currentTrack?.id === tId;
    const dur = (isCurrent && liveAudioDuration > 0) ? liveAudioDuration : (t.duration || 0);

    if (typeof dur === 'string' && dur.includes(':')) {
      return dur;
    }

    const sec = Math.floor(Number(dur) || 0);
    if (sec > 0) {
      if (sec >= 3600) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return '--:--';
  };

  const parseDurationSeconds = (t) => {
    const d = t.duration;
    if (typeof d === 'number') return d;
    if (typeof d === 'string' && d.includes(':')) {
      const parts = d.split(':').map(Number);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const validTracks = (tracks || []).filter((t) => t && (t.id || t.title));

  // Sorted tracks
  const processedTracks = React.useMemo(() => {
    if (!sortField) return validTracks;
    const sorted = [...validTracks].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'artist') {
        valA = (a.artist || '').toLowerCase();
        valB = (b.artist || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'duration') {
        valA = parseDurationSeconds(a);
        valB = parseDurationSeconds(b);
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
    return sorted;
  }, [validTracks, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Keyboard navigation inside table
  const handleKeyDown = (e) => {
    if (processedTracks.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, processedTracks.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const trackToPlay = processedTracks[focusedIndex];
      if (trackToPlay) {
        playTrack(trackToPlay, processedTracks, {
          type: playlistId ? 'playlist' : 'collection',
          id: playlistId,
          title: collectionTitle
        });
      }
    }
  };

  const isCustomPlaylist = !!playlistId;

  // ----------------------------------------------------
  // GRID VIEW (Media Cards)
  // ----------------------------------------------------
  if (viewMode === 'grid') {
    return (
      <div
        ref={tableRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 outline-none"
      >
        {processedTracks.map((t, idx) => {
          const trackId = typeof t.id === 'string' ? t.id : (t.id?.videoId || String(t.id || idx));
          const isThisPlaying = currentTrack?.id === trackId && isPlaying;
          const isThisCurrent = currentTrack?.id === trackId;
          const isFocused = focusedIndex === idx;
          const liked = isLiked(trackId);

          return (
            <div
              key={`${trackId}-${idx}`}
              onClick={() => setFocusedIndex(idx)}
              onDoubleClick={() =>
                playTrack(t, processedTracks, {
                  type: playlistId ? 'playlist' : 'collection',
                  id: playlistId,
                  title: collectionTitle
                })
              }
              onContextMenu={(e) => {
                e.preventDefault();
                if (onOpenContextMenu) onOpenContextMenu(e, t, playlistId);
              }}
              className={`p-2.5 rounded bg-dawPanel border transition-all cursor-pointer group flex flex-col justify-between ${
                isThisCurrent
                  ? 'border-dawGreen bg-dawPanel/80 shadow-[0_0_15px_rgba(0,229,153,0.15)]'
                  : isFocused
                  ? 'border-dawCyan'
                  : 'border-dawBorder hover:border-dawBorderBright hover:bg-dawHover'
              }`}
            >
              <div className="relative aspect-square rounded overflow-hidden bg-dawBg mb-2">
                <img
                  src={t.thumbnail || `https://i.ytimg.com/vi/${trackId}/mqdefault.jpg`}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThisCurrent) togglePlay();
                    else playTrack(t, processedTracks, { type: playlistId ? 'playlist' : 'collection', id: playlistId, title: collectionTitle });
                  }}
                  className={`absolute bottom-2 right-2 w-8 h-8 rounded bg-dawGreen text-black flex items-center justify-center shadow-lg transition-transform ${
                    isThisPlaying ? 'scale-100 opacity-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                  }`}
                >
                  {isThisPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                </button>
              </div>

              <div className="space-y-0.5">
                <div className={`text-xs font-bold truncate ${isThisCurrent ? 'text-dawGreen' : 'text-white'}`}>
                  {t.title || 'Unknown Title'}
                </div>
                <div className="text-[10px] text-dawMuted truncate font-mono">
                  {t.artist || 'Unknown Artist'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 mt-1 border-t border-dawBorder/50 font-mono text-[10px] text-dawMuted">
                <span>{getTrackDuration(t)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nowLiked = toggleLike(t);
                    showToast(nowLiked ? 'Saved to Liked Songs ♥' : 'Removed from Liked Songs', nowLiked ? 'success' : 'info');
                  }}
                  className={liked ? 'text-dawRed' : 'hover:text-white'}
                >
                  <Heart className={`w-3 h-3 ${liked ? 'fill-dawRed' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ----------------------------------------------------
  // PRO DATA TABLE VIEW
  // ----------------------------------------------------
  return (
    <div
      ref={tableRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full font-mono select-none outline-none border border-dawBorder rounded bg-dawSurface overflow-hidden"
    >
      {/* Table Header Bar */}
      <div
        className={`grid items-center gap-3 px-3 py-2 text-[10px] font-bold text-dawMuted uppercase tracking-wider bg-dawBg border-b border-dawBorder ${
          isCustomPlaylist
            ? 'grid-cols-[36px_1fr_180px_120px_70px_50px]'
            : 'grid-cols-[36px_1fr_200px_70px_50px]'
        }`}
      >
        <div className="text-center">#</div>

        <div
          onClick={() => toggleSort('title')}
          className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
        >
          <span>Title</span>
          {sortField === 'title' ? (
            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-dawCyan" /> : <ArrowDown className="w-3 h-3 text-dawCyan" />
          ) : (
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
          )}
        </div>

        <div
          onClick={() => toggleSort('artist')}
          className="hidden md:flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
        >
          <span>Artist / Channel</span>
          {sortField === 'artist' ? (
            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-dawCyan" /> : <ArrowDown className="w-3 h-3 text-dawCyan" />
          ) : (
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
          )}
        </div>

        {isCustomPlaylist && <div className="hidden lg:block">Added</div>}

        <div
          onClick={() => toggleSort('duration')}
          className="text-right flex items-center justify-end gap-1 cursor-pointer hover:text-white transition-colors"
        >
          <Clock className="w-3 h-3" />
          {sortField === 'duration' && (
            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-dawCyan" /> : <ArrowDown className="w-3 h-3 text-dawCyan" />
          )}
        </div>

        <div className="text-right">Actions</div>
      </div>

      {/* Rows Container */}
      <div className="divide-y divide-dawBorder/40">
        {processedTracks.map((t, idx) => {
          const trackId = typeof t.id === 'string' ? t.id : (t.id?.videoId || String(t.id || idx));
          const isThisPlaying = currentTrack?.id === trackId && isPlaying;
          const isThisCurrent = currentTrack?.id === trackId;
          const isFocused = focusedIndex === idx;
          const liked = isLiked(trackId);

          let addedDate = 'Recently';
          const rawDate = t.addedAt || t.playedAt;
          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                addedDate = d.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                });
              }
            } catch (e) {
              addedDate = 'Recently';
            }
          }

          return (
            <div
              key={`${trackId}-${idx}`}
              onClick={() => setFocusedIndex(idx)}
              onDoubleClick={() =>
                playTrack(t, processedTracks, {
                  type: playlistId ? 'playlist' : 'collection',
                  id: playlistId,
                  title: collectionTitle
                })
              }
              onContextMenu={(e) => {
                e.preventDefault();
                if (onOpenContextMenu) onOpenContextMenu(e, t, playlistId);
              }}
              className={`grid items-center gap-3 px-3 py-2 text-xs transition-colors cursor-pointer group ${
                isCustomPlaylist
                  ? 'grid-cols-[36px_1fr_180px_120px_70px_50px]'
                  : 'grid-cols-[36px_1fr_200px_70px_50px]'
              } ${
                isThisCurrent
                  ? 'daw-row-active'
                  : isFocused
                  ? 'bg-dawHover ring-1 ring-dawCyan/40'
                  : 'daw-row text-dawMuted hover:text-white'
              }`}
            >
              {/* Col 1: Index / Active Signal VU Meter */}
              <div className="flex items-center justify-center">
                {isThisPlaying ? (
                  <div className="daw-meter-bar">
                    <span className="daw-meter-col" />
                    <span className="daw-meter-col" />
                    <span className="daw-meter-col" />
                  </div>
                ) : (
                  <>
                    <span className="text-[11px] font-mono text-dawMuted group-hover:hidden">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(t, processedTracks, {
                          type: playlistId ? 'playlist' : 'collection',
                          id: playlistId,
                          title: collectionTitle
                        });
                      }}
                      className="hidden group-hover:flex items-center justify-center p-1 rounded bg-dawGreen text-black"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </>
                )}
              </div>

              {/* Col 2: Title & Thumbnail */}
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={t.thumbnail || `https://i.ytimg.com/vi/${trackId}/mqdefault.jpg`}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${trackId}/mqdefault.jpg`;
                  }}
                  className="w-7 h-7 rounded object-cover shrink-0 bg-dawBg border border-dawBorder"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold truncate ${isThisCurrent ? 'text-dawGreen font-bold' : 'text-white'}`}>
                    {t.title || 'Unknown Title'}
                  </div>
                  <div className="text-[10px] text-dawMuted truncate md:hidden">
                    {t.artist || 'Unknown Artist'}
                  </div>
                </div>
              </div>

              {/* Col 3: Artist */}
              <div className="hidden md:block text-xs text-dawMuted truncate group-hover:text-zinc-300">
                {t.artist || 'Unknown Artist'}
              </div>

              {/* Col 4: Date Added */}
              {isCustomPlaylist && (
                <div className="hidden lg:block text-[11px] text-dawMuted/80 font-mono">
                  {addedDate}
                </div>
              )}

              {/* Col 5: Duration */}
              <div className="text-right text-[11px] font-mono text-dawMuted group-hover:text-white">
                {getTrackDuration(t)}
              </div>

              {/* Col 6: Action Buttons */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nowLiked = toggleLike(t);
                    showToast(
                      nowLiked ? 'Saved to Liked Songs ♥' : 'Removed from Liked Songs',
                      nowLiked ? 'success' : 'info'
                    );
                  }}
                  className={`p-1 rounded hover:bg-dawHover transition-colors ${
                    liked ? 'text-dawRed' : 'text-dawMuted hover:text-white opacity-0 group-hover:opacity-100'
                  }`}
                  title="Like (L)"
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-dawRed' : ''}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenContextMenu) onOpenContextMenu(e, t, playlistId);
                  }}
                  className="p-1 text-dawMuted hover:text-white rounded hover:bg-dawHover opacity-0 group-hover:opacity-100 transition-colors"
                  title="More Options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
