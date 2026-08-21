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
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);
  const showToast = useToastStore((s) => s.showToast);

  const getTrackDuration = (t) => {
    const liveDuration = (currentTrack?.id === t.id && currentTrack?.duration > 0) ? currentTrack.duration : 0;
    const dur = liveDuration || t.duration || 0;

    if (typeof dur === 'string' && dur.includes(':')) {
      return dur;
    }

    const sec = Math.round(Number(dur) || 0);
    if (sec > 0) {
      if (sec >= 3600) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
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

  return (
    <div className="w-full font-syne select-none">
      {/* Table Header */}
      <div
        className={`grid items-center gap-4 px-4 py-2.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 ${
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
      <div className="divide-y divide-white/[0.02]">
        {tracks.map((t, idx) => {
          const isThisPlaying = currentTrack?.id === t.id && isPlaying;
          const isThisCurrent = currentTrack?.id === t.id;
          const liked = isLiked(t.id);
          const addedDate = t.addedAt
            ? new Date(t.addedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Recently';

          return (
            <div
              key={`${t.id}-${idx}`}
              draggable={!!onReorder}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, idx)}
              onDoubleClick={() =>
                playTrack(t, tracks, { type: playlistId ? 'playlist' : 'collection', id: playlistId, title: collectionTitle })
              }
              onContextMenu={(e) => {
                e.preventDefault();
                if (onOpenContextMenu) onOpenContextMenu(e, t, playlistId);
              }}
              className={`grid items-center gap-4 px-4 py-2.5 rounded-xl transition-all cursor-pointer group ${
                isCustomPlaylist
                  ? 'grid-cols-[40px_1fr_160px_120px_60px_60px]'
                  : 'grid-cols-[40px_1fr_180px_60px_60px]'
              } ${
                isThisCurrent
                  ? 'bg-white/10 text-emerald-400'
                  : 'hover:bg-white/5 text-zinc-300 hover:text-white'
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
                        playTrack(t, tracks, { type: playlistId ? 'playlist' : 'collection', id: playlistId, title: collectionTitle })
                      }
                      className="hidden group-hover:flex items-center justify-center"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Title & Artist */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={t.thumbnail || `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`;
                  }}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 shadow bg-zinc-900"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold truncate ${isThisCurrent ? 'text-emerald-400' : 'text-white'}`}>
                    {t.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{t.artist}</div>
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
                  className={`p-1.5 rounded-lg transition-colors ${
                    liked ? 'text-pink-500 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenContextMenu) onOpenContextMenu(e, t, playlistId);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
