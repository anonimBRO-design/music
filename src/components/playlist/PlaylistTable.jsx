import React from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import { useToastStore } from '../../stores/useToastStore';
import { Play, Heart, MoreHorizontal, Clock, GripVertical } from 'lucide-react';

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

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);
  const showToast = useToastStore((s) => s.showToast);

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

  const handleDragStart = (e, index) => {
    if (!onReorder) return;
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, targetIndex) => {
    if (!onReorder) return;
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      onReorder(sourceIndex, targetIndex);
    }
  };

  const isCustomPlaylist = !!playlistId;
  const validTracks = (tracks || []).filter((t) => t && (t.id || t.title));

  return (
    <div className="w-full font-syne select-none">
      {/* Table Header */}
      <div
        className={`grid items-center gap-4 px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-white/[0.08] ${
          isCustomPlaylist
            ? 'grid-cols-[40px_1fr_160px_120px_60px_60px]'
            : 'grid-cols-[40px_1fr_180px_60px_60px]'
        }`}
      >
        <div className="text-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">{isCustomPlaylist ? 'Album' : 'Artist / Release'}</div>
        {isCustomPlaylist && <div className="hidden lg:block">Date Added</div>}
        <div className="text-right flex items-center justify-end">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/[0.02] mt-1 space-y-1">
        {validTracks.map((t, idx) => {
          const trackId = typeof t.id === 'string' ? t.id : (t.id?.videoId || String(t.id || idx));
          const isThisPlaying = currentTrack?.id === trackId && isPlaying;
          const isThisCurrent = currentTrack?.id === trackId;
          const liked = isLiked(trackId);

          let addedDate = 'Recently';
          const rawDate = t.addedAt || t.playedAt;
          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                addedDate = d.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            } catch (e) {
              addedDate = 'Recently';
            }
          }

          return (
            <div
              key={`${trackId}-${idx}`}
              draggable={!!onReorder}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, idx)}
              onDoubleClick={() =>
                playTrack(t, validTracks, { type: playlistId ? 'playlist' : 'collection', id: playlistId, title: collectionTitle })
              }
              onContextMenu={(e) => {
                e.preventDefault();
                if (onOpenContextMenu) onOpenContextMenu(e, t, playlistId);
              }}
              className={`grid items-center gap-4 px-4 py-2.5 rounded-2xl transition-all cursor-pointer group active:bg-white/10 ${
                isCustomPlaylist
                  ? 'grid-cols-[40px_1fr_160px_120px_60px_60px]'
                  : 'grid-cols-[40px_1fr_180px_60px_60px]'
              } ${
                isThisCurrent
                  ? 'bg-white/10 text-iosEmerald border border-white/10 shadow-sm'
                  : 'hover:bg-white/[0.06] text-zinc-300 hover:text-white'
              }`}
            >
              {/* Index / Play / EQ */}
              <div className="flex items-center justify-center">
                {isThisPlaying ? (
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="spotify-eq-bar"></div>
                    <div className="spotify-eq-bar"></div>
                    <div className="spotify-eq-bar"></div>
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-zinc-500 font-mono group-hover:hidden">{idx + 1}</span>
                    <button
                      onClick={() =>
                        playTrack(t, validTracks, { type: playlistId ? 'playlist' : 'collection', id: playlistId, title: collectionTitle })
                      }
                      className="hidden group-hover:flex items-center justify-center p-1 rounded-full hover:bg-white/20 ios-btn-icon ios-btn-spring cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Title & Artist */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={t.thumbnail || `https://i.ytimg.com/vi/${trackId}/mqdefault.jpg`}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${trackId}/mqdefault.jpg`;
                  }}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 shadow bg-zinc-900"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold truncate ${isThisCurrent ? 'text-iosEmerald' : 'text-white'}`}>
                    {t.title || 'Unknown Title'}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{t.artist || 'Unknown Artist'}</div>
                </div>
              </div>

              {/* Album / Release */}
              <div className="hidden md:block text-xs text-zinc-400 truncate">
                {t.album || t.artist || 'Single'}
              </div>

              {/* Date Added (Only in custom playlist) */}
              {isCustomPlaylist && (
                <div className="hidden lg:block text-xs text-zinc-500 truncate">{addedDate}</div>
              )}

              {/* Duration */}
              <div className="text-xs text-zinc-400 font-mono text-right">{getTrackDuration(t)}</div>

              {/* Actions (Like + More) */}
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nowLiked = toggleLike(t);
                    showToast(nowLiked ? 'Added to Liked Songs ♥' : 'Removed from Liked Songs', nowLiked ? 'success' : 'info');
                  }}
                  className={`p-1.5 rounded-full hover:bg-white/10 ios-btn-icon ios-btn-spring transition-colors cursor-pointer ${
                    liked ? 'text-iosPink opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-transform ${liked ? 'fill-iosPink animate-heart-pop' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenContextMenu) onOpenContextMenu(e, t, playlistId);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 ios-btn-icon ios-btn-spring transition-all cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
