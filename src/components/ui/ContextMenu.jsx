import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { useUserStore } from '../../stores/useUserStore';
import { usePlaylistStore } from '../../stores/usePlaylistStore';
import { useToastStore } from '../../stores/useToastStore';
import { Play, FastForward, ListPlus, Heart, FolderPlus, Trash2 } from 'lucide-react';

export const useContextMenuStore = React.createContext({
  openMenu: () => {},
  closeMenu: () => {}
});

export const ContextMenu = ({ state, onClose }) => {
  const { visible, x, y, track, playlistId } = state;
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playNext = useQueueStore((s) => s.playNext);
  const addToQueue = useQueueStore((s) => s.addToQueue);
  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);
  const openPickerModal = usePlaylistStore((s) => s.openPickerModal);
  const removeTrackFromPlaylist = usePlaylistStore((s) => s.removeTrackFromPlaylist);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#global-context-menu')) {
        onClose();
      }
    };
    if (visible) {
      window.addEventListener('click', handleOutsideClick);
      window.addEventListener('contextmenu', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('contextmenu', handleOutsideClick);
    };
  }, [visible, onClose]);

  if (!visible || !track) return null;

  const liked = isLiked(track.id);

  return (
    <div
      id="global-context-menu"
      style={{
        top: Math.min(y, window.innerHeight - 260),
        left: Math.min(x, window.innerWidth - 240)
      }}
      className="fixed z-50 w-52 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1.5 shadow-2xl flex flex-col gap-0.5 text-xs font-semibold text-zinc-200"
    >
      <button
        onClick={() => {
          playTrack(track);
          onClose();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left"
      >
        <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
        Play now
      </button>
      <button
        onClick={() => {
          playNext(track);
          showToast(`Will play next`, 'info');
          onClose();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left"
      >
        <FastForward className="w-4 h-4 text-zinc-400" />
        Play next
      </button>
      <button
        onClick={() => {
          addToQueue(track);
          showToast(`Added to queue`, 'info');
          onClose();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left"
      >
        <ListPlus className="w-4 h-4 text-zinc-400" />
        Add to queue
      </button>
      <button
        onClick={() => {
          const nowLiked = toggleLike(track);
          showToast(nowLiked ? 'Added to Liked Songs ♥' : 'Removed from Liked Songs', nowLiked ? 'success' : 'info');
          onClose();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left"
      >
        <Heart className={`w-4 h-4 ${liked ? 'text-pink-500 fill-pink-500' : 'text-zinc-400'}`} />
        {liked ? 'Remove from liked' : 'Save to liked'}
      </button>
      <button
        onClick={() => {
          openPickerModal(track);
          onClose();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left"
      >
        <FolderPlus className="w-4 h-4 text-zinc-400" />
        Add to playlist
      </button>

      {playlistId && (
        <>
          <div className="h-px bg-white/10 my-1"></div>
          <button
            onClick={() => {
              removeTrackFromPlaylist(playlistId, track.id);
              showToast('Removed from playlist', 'info');
              onClose();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            Remove from playlist
          </button>
        </>
      )}
    </div>
  );
};
